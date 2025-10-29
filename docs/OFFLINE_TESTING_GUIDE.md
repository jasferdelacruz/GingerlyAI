# 🧪 Offline Functionality Testing Guide

Complete guide for testing offline features in the GingerlyAI mobile app.

---

## 📋 **What Gets Tested**

### **1. Database Functionality** 💾
- ✅ SQLite database initialization
- ✅ Table creation (predictions, remedies, models, settings)
- ✅ Index creation for performance
- ✅ CRUD operations for all tables
- ✅ Data persistence across app restarts

### **2. ML Model Functionality** 🤖
- ✅ TensorFlow.js initialization
- ✅ Backend selection (WebGL/CPU)
- ✅ Model loading from local storage
- ✅ Fallback model creation
- ✅ Image preprocessing
- ✅ Model inference
- ✅ Memory management
- ✅ Tensor cleanup

### **3. Offline Prediction Workflow** 🔮
- ✅ Image capture/selection
- ✅ ML model prediction
- ✅ Remedy retrieval
- ✅ Prediction storage
- ✅ Unsynced tracking
- ✅ Complete end-to-end workflow

### **4. Sync Functionality** 🔄
- ✅ Network status detection
- ✅ Unsynced data identification
- ✅ Batch syncing
- ✅ Sync status tracking
- ✅ Error handling during sync

### **5. Performance** ⚡
- ✅ Database read/write speed
- ✅ Model inference time
- ✅ Memory usage
- ✅ Overall app responsiveness

---

## 🚀 **Running Tests**

### **Method 1: From the Mobile App UI**

1. **Add Test Route** to your app's routing configuration:

```javascript
// mobile/src/App.jsx or routes file
import TestOffline from './pages/TestOffline';

// Add to your routes
<Route exact path="/test-offline">
  <TestOffline />
</Route>
```

2. **Navigate to Test Page**:
   - Open app in browser: `http://localhost:8100`
   - Navigate to: `/test-offline`
   - Click "Run All Tests" button

3. **View Results**:
   - See pass/fail status for each test
   - Review detailed messages
   - Download results as JSON

### **Method 2: From Browser Console**

```javascript
// Open your app in browser
// Open DevTools Console (F12)

// Import and run tests
import { runOfflineTests } from './tests/offlineTests';

// Run tests
const results = await runOfflineTests();

// View results
console.log('Test Results:', results);
```

### **Method 3: Programmatically**

```javascript
import { runOfflineTests } from './tests/offlineTests';

async function testOfflineFeatures() {
  const results = await runOfflineTests();
  
  if (results.failed === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.error(`❌ ${results.failed} tests failed`);
  }
  
  return results;
}

// Run
testOfflineFeatures();
```

---

## 📊 **Understanding Test Results**

### **Test Output Format**

Each test produces output like this:

```
✅ PASS: Database Initialization - Database initialized successfully
❌ FAIL: Model Inference - Error: Model not loaded
```

### **Summary Statistics**

```
Total Tests:     25
✅ Passed:       23
❌ Failed:       2
⏱️  Duration:    3.5s
📈 Pass Rate:   92.00%
```

### **Result Object Structure**

```javascript
{
  total: 25,           // Total number of tests
  passed: 23,          // Number of passed tests
  failed: 2,           // Number of failed tests
  duration: 3500,      // Total duration in ms
  results: [           // Detailed results array
    {
      testName: "Database Initialization",
      passed: true,
      message: "Database initialized successfully",
      timestamp: "2024-01-15T10:30:00.000Z"
    },
    // ... more results
  ]
}
```

---

## 🔍 **Individual Test Descriptions**

### **Test 1: Database Initialization**

**What it tests:**
- SQLite database can be created
- Connection is established
- Tables are created successfully
- Indexes are created

**Expected behavior:**
- Database initializes without errors
- `isInitialized` flag is set to `true`
- Database connection object exists

**Common failures:**
- SQLite plugin not installed
- Browser doesn't support IndexedDB (for web)
- Permission issues on mobile

---

### **Test 2: Offline Prediction Storage**

**What it tests:**
- Predictions can be saved to local database
- Predictions can be retrieved
- Unsynced predictions are tracked correctly
- Data integrity is maintained

**Expected behavior:**
- Prediction saved successfully
- Retrieved prediction matches saved data
- Unsynced predictions list includes new prediction

**Common failures:**
- Database not initialized
- Invalid prediction data format
- JSON serialization errors

---

### **Test 3: Remedy Offline Storage**

**What it tests:**
- Remedies can be saved in bulk
- Remedies can be retrieved
- Individual remedy lookup by disease code

**Expected behavior:**
- All remedies saved successfully
- Retrieved remedies match saved data
- Disease code lookup returns correct remedy

**Common failures:**
- JSON array parsing errors
- Duplicate disease codes
- Missing required fields

---

### **Test 4: ML Model Initialization**

**What it tests:**
- TensorFlow.js loads correctly
- Backends are available (WebGL, CPU)
- ML service initializes
- Model loads successfully

**Expected behavior:**
- TensorFlow.js ready
- At least one backend available
- Model loaded and ready for inference

**Common failures:**
- TensorFlow.js not imported
- No compatible backend available
- Model file not found
- Model format incompatible

---

### **Test 5: ML Model Inference**

**What it tests:**
- Model can process images
- Predictions are generated
- Results are formatted correctly
- Memory is managed (tensors disposed)

**Expected behavior:**
- Prediction completes in < 5 seconds
- Returns array of predictions for all classes
- Top prediction identified
- No memory leaks (tensors cleaned up)

**Common failures:**
- Model not loaded
- Image preprocessing errors
- Invalid input shape
- Memory leaks (tensors not disposed)

---

### **Test 6: Complete Offline Workflow**

**What it tests:**
- End-to-end offline prediction flow
- Image → Prediction → Remedy → Storage

**Expected behavior:**
- Full workflow completes without errors
- Prediction saved to database
- Marked as unsynced
- Can be marked as synced later

**Common failures:**
- Any failure in the chain breaks the workflow
- Image processing errors
- Remedy not found for prediction

---

### **Test 7: Sync Service Functionality**

**What it tests:**
- Network status detection
- Sync status tracking
- Pending predictions count

**Expected behavior:**
- Network status accurately detected
- Correct count of unsynced predictions
- Last sync time tracked

**Common failures:**
- Network API not available
- User not authenticated
- Storage access errors

---

### **Test 8: App Settings Storage**

**What it tests:**
- Key-value settings storage
- Settings retrieval
- Settings update

**Expected behavior:**
- Settings saved and retrieved correctly
- Non-existent settings return null
- Settings can be updated

**Common failures:**
- Database not initialized
- Invalid JSON data
- Key conflicts

---

### **Test 9: Performance Benchmarks**

**What it tests:**
- Database write performance
- Database read performance
- ML inference speed

**Expected behavior:**
- Database writes: < 1 second
- Database reads: < 1 second
- ML inference: < 5 seconds

**Common failures:**
- Large dataset slowing down operations
- Slow device/browser
- Memory constraints

---

## ⚠️ **Troubleshooting Test Failures**

### **Database Initialization Failed**

```
❌ FAIL: Database Initialization - Error: SQLite plugin not installed
```

**Solution:**
```bash
# Install SQLite plugin
npm install @capacitor-community/sqlite

# Sync with native platforms
npx cap sync
```

---

### **TensorFlow.js Not Ready**

```
❌ FAIL: TensorFlow.js Ready - Error: tf is not defined
```

**Solution:**
```bash
# Install TensorFlow.js
npm install @tensorflow/tfjs
npm install @tensorflow/tfjs-backend-webgl

# Verify imports in service file
```

---

### **Model Not Found**

```
❌ FAIL: Model Loaded - Error: Model file not found
```

**Solution:**
1. Check if model file exists in `public/assets/tfjs_model/`
2. Verify model path in database
3. Try loading fallback model instead

---

### **Inference Timeout**

```
❌ FAIL: ML Inference Performance - Inference time: 8500ms
```

**Solution:**
1. Use CPU backend instead of WebGL
2. Reduce image resolution
3. Test on faster device
4. Check for memory leaks

---

### **Network Detection Failed**

```
❌ FAIL: Network Status Check - Error: Network plugin not available
```

**Solution:**
```bash
# Install Network plugin
npm install @capacitor/network

# Sync
npx cap sync
```

---

## 📈 **Performance Benchmarks**

### **Target Performance Metrics**

| Operation | Target | Good | Acceptable | Poor |
|-----------|--------|------|------------|------|
| **Database Write** | < 100ms | < 500ms | < 1000ms | > 1000ms |
| **Database Read** | < 50ms | < 200ms | < 1000ms | > 1000ms |
| **ML Inference** | < 1000ms | < 2000ms | < 5000ms | > 5000ms |
| **Image Preprocessing** | < 200ms | < 500ms | < 1000ms | > 1000ms |
| **Sync Operation** | < 2000ms | < 5000ms | < 10000ms | > 10000ms |

### **Memory Benchmarks**

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Tensors in Memory** | < 10 | 10-50 | > 50 |
| **Model Size** | < 5MB | 5-20MB | > 20MB |
| **Database Size** | < 10MB | 10-50MB | > 50MB |

---

## 🧪 **Testing Checklist**

### **Before Deployment**

- [ ] All tests pass
- [ ] Database initializes correctly
- [ ] ML model loads without errors
- [ ] Predictions work offline
- [ ] Sync works when online
- [ ] Performance meets targets
- [ ] No memory leaks detected
- [ ] Works on target devices (iOS/Android)

### **After Updates**

- [ ] Re-run all tests
- [ ] Check for regressions
- [ ] Verify new features work offline
- [ ] Update test suite if needed

---

## 📱 **Device-Specific Testing**

### **iOS Testing**

```bash
# Build and run on iOS
npm run build
npx cap copy ios
npx cap open ios

# Run tests in Safari Web Inspector
```

### **Android Testing**

```bash
# Build and run on Android
npm run build
npx cap copy android
npx cap open android

# Run tests in Chrome DevTools
```

### **Web Testing**

```bash
# Run development server
npm start

# Open in browser
open http://localhost:8100/test-offline

# Open DevTools and run tests
```

---

## 📊 **Continuous Testing**

### **Automated Testing Script**

```javascript
// scripts/test-offline.js
import { runOfflineTests } from '../src/tests/offlineTests';

async function automatedTests() {
  console.log('Starting automated offline tests...');
  
  const results = await runOfflineTests();
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    `test-results-${Date.now()}.json`,
    JSON.stringify(results, null, 2)
  );
  
  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

automatedTests();
```

### **Run as npm script**

```json
{
  "scripts": {
    "test:offline": "node scripts/test-offline.js"
  }
}
```

---

## 🎯 **Best Practices**

### **1. Test Regularly**
- Run tests before each commit
- Run tests after dependency updates
- Run tests on multiple devices

### **2. Monitor Performance**
- Track inference times
- Monitor memory usage
- Check database size growth

### **3. Document Failures**
- Save test results
- Log error details
- Track failure patterns

### **4. Update Tests**
- Add tests for new features
- Update tests when code changes
- Remove obsolete tests

---

## 📚 **Additional Resources**

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Capacitor SQLite Plugin](https://github.com/capacitor-community/sqlite)
- [Ionic Testing Guide](https://ionicframework.com/docs/developing/testing)

---

*Offline Testing Guide for GingerlyAI* 🧪

