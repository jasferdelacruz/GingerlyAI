# GingerlyAI iOS Setup Script (PowerShell)
# Note: This prepares the project but iOS build requires macOS

Write-Host "🍎 GingerlyAI iOS Setup (Windows Preparation)" -ForegroundColor Green
Write-Host "=============================================="
Write-Host ""

# Check if running on Windows
if ($env:OS -ne "Windows_NT") {
    Write-Host "❌ This script is for Windows. Use setup-ios.sh on macOS" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  Note: iOS development requires macOS" -ForegroundColor Yellow
Write-Host "   This script will prepare the project for iOS"
Write-Host "   You'll need to transfer to a Mac for the final build"
Write-Host ""

# Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host ""
}

# Build the web assets
Write-Host "🔨 Building web assets..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web assets built successfully" -ForegroundColor Green
Write-Host ""

# Add iOS platform (will create files but can't build)
if (!(Test-Path "ios")) {
    Write-Host "📱 Adding iOS platform configuration..." -ForegroundColor Cyan
    npx cap add ios
    Write-Host "✅ iOS platform files created" -ForegroundColor Green
} else {
    Write-Host "✅ iOS platform already exists" -ForegroundColor Green
}
Write-Host ""

Write-Host "=============================================="
Write-Host "✅ iOS Project Prepared!" -ForegroundColor Green
Write-Host "=============================================="
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Transfer project to a Mac computer"
Write-Host ""
Write-Host "2. On the Mac, run:" -ForegroundColor Cyan
Write-Host "   cd mobile"
Write-Host "   chmod +x setup-ios.sh"
Write-Host "   ./setup-ios.sh"
Write-Host ""
Write-Host "3. Or manually:" -ForegroundColor Cyan
Write-Host "   - Install Xcode from App Store"
Write-Host "   - Install CocoaPods: sudo gem install cocoapods"
Write-Host "   - Run: npm run ios:open"
Write-Host ""
Write-Host "4. For detailed instructions:" -ForegroundColor Cyan
Write-Host "   See mobile/IOS_SETUP_GUIDE.md"
Write-Host ""
Write-Host "🍎 Project ready for macOS build!"

