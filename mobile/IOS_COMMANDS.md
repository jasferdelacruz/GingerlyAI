# 🍎 iOS Commands Quick Reference

Quick reference for common iOS development commands in GingerlyAI.

---

## 📱 **Essential Commands**

### **Setup & Installation**
```bash
# Automated setup (macOS only)
cd mobile
chmod +x setup-ios.sh
./setup-ios.sh

# Manual setup
npm install                    # Install dependencies
npm run build                  # Build web assets
npm run ios:add                # Add iOS platform (first time only)
npm run ios:sync               # Sync web assets to iOS
```

### **Development**
```bash
# Open in Xcode
npm run ios:open

# Build and open in Xcode
npm run ios:build

# Run on device/simulator
npm run ios:run

# Sync changes only
npm run ios:sync

# Copy assets only (no build)
npm run ios:copy
```

---

## 🔧 **Capacitor Commands**

```bash
# Add iOS platform
npx cap add ios

# Sync all changes
npx cap sync ios

# Copy web assets only
npx cap copy ios

# Update Capacitor iOS
npx cap update ios

# Open in Xcode
npx cap open ios

# Run on device
npx cap run ios --target="iPhone 14 Pro"

# List available devices
npx cap run ios --list
```

---

## 🛠️ **Xcode Commands** (Terminal)

```bash
# Build from command line
xcodebuild -workspace ios/App/App.xcworkspace \
           -scheme App \
           -configuration Debug \
           build

# Run on simulator
open -a Simulator
xcrun simctl boot "iPhone 14 Pro"
xcrun simctl install booted ios/App/build/App.app

# List simulators
xcrun simctl list devices

# Clean build
xcodebuild clean -workspace ios/App/App.xcworkspace -scheme App
```

---

## 📦 **CocoaPods Commands**

```bash
# Install pods
cd ios/App
pod install

# Update pods
pod update

# Repo update
pod repo update

# Deintegrate (if needed)
pod deintegrate
```

---

## 🚀 **Build & Release**

### **Development Build**
```bash
# Build and run on connected device
npm run build
npx cap sync ios
npx cap run ios --target="iPhone"
```

### **Release Build**
```bash
# 1. Build optimized web assets
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
#    Product > Archive
#    Window > Organizer > Distribute
```

---

## 🧪 **Testing**

```bash
# Run on specific simulator
npx cap run ios --target="iPhone 14 Pro"

# Run on physical device
npx cap run ios --target="iPhone" --livereload

# Run tests (in Xcode)
# Product > Test (Cmd+U)
```

---

## 🔍 **Debugging**

```bash
# View device logs
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "App"'

# View crash logs
open ~/Library/Logs/DiagnosticReports/

# Safari Web Inspector (for debugging WebView)
# Safari > Develop > [Your Device] > [App]
```

---

## 🧹 **Cleanup**

```bash
# Clean build folder
cd ios/App
xcodebuild clean

# Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Remove and re-add iOS platform
npx cap remove ios
npm run ios:add
```

---

## ⚙️ **Configuration**

```bash
# Update app version
# Edit ios/App/App/Info.plist
# CFBundleShortVersionString = 1.0.0
# CFBundleVersion = 1

# Update bundle identifier
# Edit capacitor.config.js
# appId: 'com.gingerlyai.mobile'
```

---

## 📊 **Common Workflows**

### **First Time Setup**
```bash
cd mobile
npm install
npm run build
npm run ios:add
npm run ios:open
# In Xcode: Select device and run
```

### **Daily Development**
```bash
# Make changes to React code
npm run ios:sync    # Sync changes
# Refresh in simulator (Cmd+R)
```

### **Adding New Native Plugin**
```bash
npm install @capacitor/[plugin-name]
npx cap sync ios
cd ios/App
pod install
```

### **Preparing for App Store**
```bash
npm run build
npx cap sync ios
npx cap open ios
# In Xcode: Product > Archive
```

---

## 🆘 **Troubleshooting Commands**

```bash
# Fix "Unable to boot simulator"
xcrun simctl shutdown all
xcrun simctl erase all

# Fix "Provisioning profile issues"
# Delete ~/Library/MobileDevice/Provisioning Profiles
# Xcode > Preferences > Accounts > Download Manual Profiles

# Fix "Pod install fails"
cd ios/App
pod repo update
pod deintegrate
pod install

# Fix "Build fails"
# Clean:
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
# Rebuild in Xcode
```

---

## 📝 **Environment Info**

```bash
# Check versions
xcodebuild -version              # Xcode version
pod --version                    # CocoaPods version
node --version                   # Node.js version
npx cap --version                # Capacitor version

# Check iOS SDKs
xcodebuild -showsdks

# Check connected devices
xcrun xctrace list devices
```

---

## 🎯 **Quick Tips**

1. **Always build web assets first**: `npm run build`
2. **Sync before opening Xcode**: `npx cap sync ios`
3. **Clean when things break**: Clean build folder in Xcode
4. **Use npm scripts**: They combine multiple commands
5. **Check logs**: Xcode console shows errors clearly

---

## 📚 **Useful Resources**

- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **Xcode Help**: Xcode > Help > Xcode Help
- **Apple Developer**: https://developer.apple.com/ios/

---

*Quick Reference for GingerlyAI iOS Development* 🍎

