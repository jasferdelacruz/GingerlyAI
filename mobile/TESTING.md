# 🧪 Testing GingerlyAI Mobile App

Quick reference for testing offline functionality.

---

## 🚀 **Quick Start**

### **1. Run Tests from UI**

```bash
# Start development server
npm start

# Navigate to test page
open http://localhost:8100/test-offline

# Click "Run All Tests" button
```

### **2. Run Tests from Console**

```javascript
// Open DevTools Console (F12)
import { runOfflineTests } from './tests/offlineTests';
await runOfflineTests();
```

---

## 📋 **Test Suites**

| Suite | Tests | What it Checks |
|-------|-------|----------------|
| **Database** | 5 | SQLite initialization, CRUD operations |
| **ML Model** | 6 | Model loading, inference, memory |
| **Predictions** | 4 | Offline prediction workflow |
| **Sync** | 3 | Network detection, sync status |
| **Performance** | 3 | Speed benchmarks |

**Total: 21 Tests**

---

## ✅ **Expected Results**

```
✅ All tests should pass
⏱️  Duration: ~3-5 seconds
📈 Pass Rate: 100%
```

---

## 🔍 **Common Test Failures**

### **Database Not Initialized**
```bash
npm install @capacitor-community/sqlite
npx cap sync
```

### **TensorFlow.js Not Found**
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl
```

### **Model Not Loaded**
- Check `public/assets/tfjs_model/` exists
- Verify model path in database
- Model will create fallback if missing

---

## 📊 **Performance Targets**

- **Database Write**: < 1 second
- **Database Read**: < 1 second  
- **ML Inference**: < 5 seconds
- **Full Test Suite**: < 10 seconds

---

## 🎯 **Testing Checklist**

Before deployment:
- [ ] All tests pass
- [ ] No console errors
- [ ] Performance meets targets
- [ ] Works on iOS simulator
- [ ] Works on Android emulator
- [ ] Works in web browser

---

## 📱 **Device Testing**

### **iOS**
```bash
npm run build
npx cap sync ios
npx cap open ios
# Run tests in Safari Web Inspector
```

### **Android**
```bash
npm run build
npx cap sync android
npx cap open android
# Run tests in Chrome DevTools
```

### **Web**
```bash
npm start
# Navigate to /test-offline
# Open DevTools Console
```

---

## 💡 **Tips**

1. **Clear Cache**: Clear browser cache before testing
2. **Check Console**: Always check console for detailed logs
3. **Download Results**: Use "Download Results" button to save test output
4. **Performance**: Test on actual devices for accurate performance metrics
5. **Network**: Test both online and offline scenarios

---

## 📚 **More Info**

See `/docs/OFFLINE_TESTING_GUIDE.md` for detailed documentation.

---

*Quick Testing Reference* 🧪

