#!/bin/bash

# GingerlyAI iOS Setup Script
# This script sets up the iOS platform for the mobile app

echo "🍎 GingerlyAI iOS Setup"
echo "======================================"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: iOS development requires macOS"
    echo "   Please use a Mac computer to build for iOS"
    exit 1
fi

echo "✅ Running on macOS"
echo ""

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed"
    echo "   Please install Xcode from the App Store"
    echo "   https://apps.apple.com/app/xcode/id497799835"
    exit 1
fi

XCODE_VERSION=$(xcodebuild -version | head -n 1)
echo "✅ $XCODE_VERSION installed"
echo ""

# Check for CocoaPods
if ! command -v pod &> /dev/null; then
    echo "⚠️  CocoaPods is not installed"
    echo "   Installing CocoaPods..."
    sudo gem install cocoapods
    if [ $? -eq 0 ]; then
        echo "✅ CocoaPods installed successfully"
    else
        echo "❌ Failed to install CocoaPods"
        exit 1
    fi
else
    POD_VERSION=$(pod --version)
    echo "✅ CocoaPods $POD_VERSION installed"
fi
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION installed"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
    echo ""
fi

# Build the web assets
echo "🔨 Building web assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Web assets built successfully"
echo ""

# Check if iOS platform exists
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
    echo "✅ iOS platform added"
else
    echo "✅ iOS platform already exists"
fi
echo ""

# Sync changes to iOS
echo "🔄 Syncing changes to iOS..."
npx cap sync ios
echo "✅ iOS sync complete"
echo ""

# Install CocoaPods dependencies
echo "📦 Installing iOS dependencies (CocoaPods)..."
cd ios/App
pod install
cd ../..
echo "✅ iOS dependencies installed"
echo ""

echo "======================================"
echo "🎉 iOS Setup Complete!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open the project in Xcode:"
echo "   npm run ios:open"
echo ""
echo "2. Or use this command:"
echo "   npx cap open ios"
echo ""
echo "3. In Xcode:"
echo "   - Select your device or simulator"
echo "   - Click the Play button (▶️) to run"
echo ""
echo "4. For detailed instructions, see:"
echo "   mobile/IOS_SETUP_GUIDE.md"
echo ""
echo "🍎 Happy iOS Development!"

