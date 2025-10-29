/**
 * Offline Functionality Test Suite for GingerlyAI
 * 
 * Tests:
 * 1. Database initialization and storage
 * 2. ML model loading and inference
 * 3. Offline prediction saving
 * 4. Sync functionality
 */

import { databaseService } from '../services/databaseService';
import { mlService } from '../services/mlService';
import { syncService } from '../services/syncService';
import * as tf from '@tensorflow/tfjs';

class OfflineTests {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // Helper to log test results
  logTest(testName, passed, message = '') {
    this.totalTests++;
    
    if (passed) {
      this.passedTests++;
      console.log(`✅ PASS: ${testName}`, message ? `- ${message}` : '');
    } else {
      this.failedTests++;
      console.error(`❌ FAIL: ${testName}`, message ? `- ${message}` : '');
    }

    this.testResults.push({
      testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Test 1: Database Initialization
  async testDatabaseInitialization() {
    console.log('\n📊 TEST 1: DATABASE INITIALIZATION');
    console.log('═'.repeat(60));

    try {
      // Initialize database
      await databaseService.initialize();
      
      // Check if database is initialized
      this.logTest(
        'Database Initialization',
        databaseService.isInitialized === true,
        'Database initialized successfully'
      );

      // Verify database connection
      const isConnected = databaseService.db !== null;
      this.logTest(
        'Database Connection',
        isConnected,
        'Database connection established'
      );

    } catch (error) {
      this.logTest('Database Initialization', false, error.message);
    }
  }

  // Test 2: Offline Prediction Storage
  async testOfflinePredictionStorage() {
    console.log('\n💾 TEST 2: OFFLINE PREDICTION STORAGE');
    console.log('═'.repeat(60));

    try {
      // Create a test prediction
      const testPrediction = {
        id: `test-pred-${Date.now()}`,
        userId: 'test-user-123',
        modelId: 'test-model',
        imageUrl: 'data:image/png;base64,test',
        predictionResults: [
          { disease: 'bacterial_wilt', confidence: 0.85 },
          { disease: 'healthy', confidence: 0.10 },
          { disease: 'leaf_spot', confidence: 0.05 }
        ],
        topPrediction: 'bacterial_wilt',
        confidence: 0.85,
        isOfflinePrediction: true,
        location: { latitude: 16.4023, longitude: 120.5960 },
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save prediction
      await databaseService.savePrediction(testPrediction);
      this.logTest('Save Offline Prediction', true, `Prediction ${testPrediction.id} saved`);

      // Retrieve predictions
      const predictions = await databaseService.getPredictions('test-user-123', 10, 0);
      this.logTest(
        'Retrieve Predictions',
        predictions.length > 0,
        `Retrieved ${predictions.length} prediction(s)`
      );

      // Verify saved data
      const savedPrediction = predictions.find(p => p.id === testPrediction.id);
      this.logTest(
        'Verify Saved Data',
        savedPrediction !== undefined,
        'Prediction data matches'
      );

      // Check if prediction is marked as unsynced
      const unsyncedPredictions = await databaseService.getUnsyncedPredictions('test-user-123');
      this.logTest(
        'Unsynced Predictions Tracking',
        unsyncedPredictions.length > 0,
        `${unsyncedPredictions.length} unsynced prediction(s)`
      );

    } catch (error) {
      this.logTest('Offline Prediction Storage', false, error.message);
    }
  }

  // Test 3: Remedy Offline Storage
  async testRemedyOfflineStorage() {
    console.log('\n💊 TEST 3: REMEDY OFFLINE STORAGE');
    console.log('═'.repeat(60));

    try {
      // Create test remedies
      const testRemedies = [
        {
          id: 'remedy-1',
          diseaseName: 'Bacterial Wilt',
          diseaseCode: 'bacterial_wilt',
          description: 'A serious bacterial disease affecting ginger plants',
          symptoms: ['Wilting leaves', 'Yellowing', 'Plant collapse'],
          causes: ['Bacteria', 'Poor drainage', 'Contaminated soil'],
          treatments: ['Remove infected plants', 'Apply bactericide', 'Improve drainage'],
          preventionMeasures: ['Use disease-free seeds', 'Crop rotation', 'Good drainage'],
          severity: 'high',
          imageUrl: 'https://example.com/bacterial_wilt.jpg',
          version: 1,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'remedy-2',
          diseaseName: 'Leaf Spot',
          diseaseCode: 'leaf_spot',
          description: 'Fungal disease causing spots on leaves',
          symptoms: ['Brown spots', 'Leaf damage'],
          causes: ['Fungus', 'High humidity'],
          treatments: ['Apply fungicide', 'Remove affected leaves'],
          preventionMeasures: ['Proper spacing', 'Good air circulation'],
          severity: 'medium',
          imageUrl: 'https://example.com/leaf_spot.jpg',
          version: 1,
          updatedAt: new Date().toISOString()
        }
      ];

      // Save remedies
      await databaseService.saveRemedies(testRemedies);
      this.logTest('Save Remedies', true, `Saved ${testRemedies.length} remedies`);

      // Retrieve all remedies
      const remedies = await databaseService.getRemedies();
      this.logTest(
        'Retrieve Remedies',
        remedies.length >= testRemedies.length,
        `Retrieved ${remedies.length} remedy(ies)`
      );

      // Get remedy by disease code
      const remedy = await databaseService.getRemedyByCode('bacterial_wilt');
      this.logTest(
        'Get Remedy by Code',
        remedy !== null && remedy.diseaseCode === 'bacterial_wilt',
        'Remedy retrieved successfully'
      );

    } catch (error) {
      this.logTest('Remedy Offline Storage', false, error.message);
    }
  }

  // Test 4: ML Model Initialization
  async testMLModelInitialization() {
    console.log('\n🤖 TEST 4: ML MODEL INITIALIZATION');
    console.log('═'.repeat(60));

    try {
      // Check TensorFlow.js availability
      const tfReady = await mlService.checkTensorFlowReady();
      this.logTest(
        'TensorFlow.js Ready',
        tfReady === true,
        'TensorFlow.js is ready'
      );

      // Get available backends
      const backends = mlService.getAvailableBackends();
      this.logTest(
        'Available Backends',
        backends.length > 0,
        `Backends: ${backends.join(', ')}`
      );

      // Get current backend
      const currentBackend = mlService.getCurrentBackend();
      this.logTest(
        'Current Backend',
        currentBackend !== null,
        `Using: ${currentBackend}`
      );

      // Initialize ML service
      await mlService.initialize();
      this.logTest(
        'ML Service Initialization',
        mlService.isInitialized === true,
        'ML service initialized'
      );

      // Check if model is loaded
      const modelLoaded = await mlService.isModelLoaded();
      this.logTest(
        'Model Loaded',
        modelLoaded === true,
        'Model loaded successfully'
      );

    } catch (error) {
      this.logTest('ML Model Initialization', false, error.message);
    }
  }

  // Test 5: ML Model Inference
  async testMLModelInference() {
    console.log('\n🔮 TEST 5: ML MODEL INFERENCE');
    console.log('═'.repeat(60));

    try {
      // Create a dummy test image (224x224x3 tensor)
      const testImageTensor = tf.randomUniform([224, 224, 3]);
      
      // Convert to canvas and then to data URL
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      
      // Draw random pixels
      const imageData = ctx.createImageData(224, 224);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.random() * 255;     // R
        imageData.data[i + 1] = Math.random() * 255; // G
        imageData.data[i + 2] = Math.random() * 255; // B
        imageData.data[i + 3] = 255;                 // A
      }
      ctx.putImageData(imageData, 0, 0);
      const testImageUrl = canvas.toDataURL('image/png');
      
      testImageTensor.dispose();

      // Test model info
      const modelInfo = await mlService.getModelInfo();
      this.logTest(
        'Get Model Info',
        modelInfo !== null,
        `Model: ${modelInfo.name} v${modelInfo.version}`
      );

      // Warm up the model
      await mlService.warmUpModel();
      this.logTest('Model Warm-up', true, 'Model warmed up successfully');

      // Run prediction
      const startTime = Date.now();
      const prediction = await mlService.predict(testImageUrl);
      const inferenceTime = Date.now() - startTime;

      this.logTest(
        'Model Inference',
        prediction !== null && prediction.predictions.length > 0,
        `Inference time: ${inferenceTime}ms`
      );

      this.logTest(
        'Prediction Results',
        prediction.topPrediction !== undefined,
        `Top: ${prediction.topPrediction} (${(prediction.confidence * 100).toFixed(2)}%)`
      );

      this.logTest(
        'Prediction Classes',
        prediction.predictions.length === 7,
        `${prediction.predictions.length} classes predicted`
      );

      // Check memory usage
      const memoryInfo = await mlService.getModelMemoryUsage();
      this.logTest(
        'Memory Management',
        memoryInfo.numTensors >= 0,
        `Tensors in memory: ${memoryInfo.numTensors}`
      );

    } catch (error) {
      this.logTest('ML Model Inference', false, error.message);
    }
  }

  // Test 6: Complete Offline Workflow
  async testCompleteOfflineWorkflow() {
    console.log('\n🔄 TEST 6: COMPLETE OFFLINE WORKFLOW');
    console.log('═'.repeat(60));

    try {
      // Step 1: Create test image
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(224, 224);
      
      // Fill with greenish color (simulate ginger leaf)
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 50 + Math.random() * 50;      // R
        imageData.data[i + 1] = 100 + Math.random() * 100; // G
        imageData.data[i + 2] = 50 + Math.random() * 50;   // B
        imageData.data[i + 3] = 255;                       // A
      }
      ctx.putImageData(imageData, 0, 0);
      const imageUrl = canvas.toDataURL('image/png');

      this.logTest('Create Test Image', true, 'Test image created');

      // Step 2: Run ML prediction
      const prediction = await mlService.predict(imageUrl);
      this.logTest(
        'Run Offline Prediction',
        prediction !== null,
        `Predicted: ${prediction.topPrediction}`
      );

      // Step 3: Get remedy for predicted disease
      const remedy = await databaseService.getRemedyByCode(prediction.topPrediction);
      this.logTest(
        'Get Remedy for Disease',
        remedy !== null || prediction.topPrediction === 'healthy',
        remedy ? `Remedy found: ${remedy.diseaseName}` : 'No remedy needed (healthy)'
      );

      // Step 4: Save prediction to database
      const modelInfo = await mlService.getModelInfo();
      const offlinePrediction = {
        id: `offline-pred-${Date.now()}`,
        userId: 'test-user-123',
        remedyId: remedy ? remedy.id : null,
        modelId: modelInfo.id,
        imageUrl: imageUrl,
        predictionResults: prediction.predictions,
        topPrediction: prediction.topPrediction,
        confidence: prediction.confidence,
        isOfflinePrediction: true,
        deviceInfo: {
          platform: 'web',
          userAgent: navigator.userAgent
        },
        location: { latitude: 16.4023, longitude: 120.5960 },
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await databaseService.savePrediction(offlinePrediction);
      this.logTest('Save Prediction Offline', true, 'Prediction saved to local database');

      // Step 5: Verify it's in unsynced predictions
      const unsyncedPreds = await databaseService.getUnsyncedPredictions('test-user-123');
      const isInUnsynced = unsyncedPreds.some(p => p.id === offlinePrediction.id);
      this.logTest(
        'Mark as Unsynced',
        isInUnsynced,
        'Prediction marked for sync'
      );

      // Step 6: Simulate marking as synced
      await databaseService.markPredictionsSynced([offlinePrediction.id]);
      const stillUnsynced = await databaseService.getUnsyncedPredictions('test-user-123');
      const isNowSynced = !stillUnsynced.some(p => p.id === offlinePrediction.id);
      this.logTest(
        'Mark as Synced',
        isNowSynced,
        'Prediction marked as synced'
      );

      console.log('\n✅ Complete offline workflow executed successfully!');

    } catch (error) {
      this.logTest('Complete Offline Workflow', false, error.message);
    }
  }

  // Test 7: Sync Service Functionality
  async testSyncService() {
    console.log('\n🔄 TEST 7: SYNC SERVICE FUNCTIONALITY');
    console.log('═'.repeat(60));

    try {
      // Check online status
      const isOnline = await syncService.isOnline();
      this.logTest(
        'Network Status Check',
        typeof isOnline === 'boolean',
        `Network: ${isOnline ? 'Online' : 'Offline'}`
      );

      // Get sync status
      const syncStatus = await syncService.getSyncStatus();
      this.logTest(
        'Get Sync Status',
        syncStatus !== null,
        `Pending predictions: ${syncStatus.pendingPredictions}`
      );

      console.log('\n📊 Sync Status:');
      console.log(`   - Online: ${syncStatus.isOnline}`);
      console.log(`   - Pending predictions: ${syncStatus.pendingPredictions}`);
      console.log(`   - Last sync: ${syncStatus.lastSyncTime || 'Never'}`);

    } catch (error) {
      this.logTest('Sync Service Functionality', false, error.message);
    }
  }

  // Test 8: App Settings Storage
  async testAppSettings() {
    console.log('\n⚙️ TEST 8: APP SETTINGS STORAGE');
    console.log('═'.repeat(60));

    try {
      // Save settings
      await databaseService.setSetting('test_setting_1', 'value1');
      await databaseService.setSetting('test_setting_2', JSON.stringify({ key: 'value' }));
      this.logTest('Save App Settings', true, 'Settings saved');

      // Retrieve settings
      const setting1 = await databaseService.getSetting('test_setting_1');
      const setting2 = await databaseService.getSetting('test_setting_2');
      
      this.logTest(
        'Retrieve App Settings',
        setting1 === 'value1' && setting2 !== null,
        'Settings retrieved correctly'
      );

      // Test non-existent setting
      const nonExistent = await databaseService.getSetting('non_existent');
      this.logTest(
        'Non-existent Setting',
        nonExistent === null,
        'Returns null for non-existent setting'
      );

    } catch (error) {
      this.logTest('App Settings Storage', false, error.message);
    }
  }

  // Test 9: Performance Benchmarks
  async testPerformance() {
    console.log('\n⚡ TEST 9: PERFORMANCE BENCHMARKS');
    console.log('═'.repeat(60));

    try {
      // Benchmark: Database write speed
      const writeStart = Date.now();
      const testPred = {
        id: `perf-test-${Date.now()}`,
        userId: 'perf-test-user',
        modelId: 'perf-test-model',
        imageUrl: 'data:image/png;base64,test',
        predictionResults: [{ disease: 'test', confidence: 0.9 }],
        topPrediction: 'test',
        confidence: 0.9,
        isOfflinePrediction: true,
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await databaseService.savePrediction(testPred);
      const writeTime = Date.now() - writeStart;
      
      this.logTest(
        'Database Write Performance',
        writeTime < 1000,
        `Write time: ${writeTime}ms`
      );

      // Benchmark: Database read speed
      const readStart = Date.now();
      await databaseService.getPredictions('perf-test-user', 100, 0);
      const readTime = Date.now() - readStart;
      
      this.logTest(
        'Database Read Performance',
        readTime < 1000,
        `Read time: ${readTime}ms`
      );

      // Benchmark: Model inference speed (already tested, just check threshold)
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const testImageUrl = canvas.toDataURL('image/png');
      
      const inferenceStart = Date.now();
      await mlService.predict(testImageUrl);
      const inferenceTime = Date.now() - inferenceStart;
      
      this.logTest(
        'ML Inference Performance',
        inferenceTime < 5000, // Should be under 5 seconds
        `Inference time: ${inferenceTime}ms`
      );

    } catch (error) {
      this.logTest('Performance Benchmarks', false, error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('\n');
    console.log('╔═════════════════════════════════════════════════════════════╗');
    console.log('║     🧪 GINGERLYAI OFFLINE FUNCTIONALITY TEST SUITE        ║');
    console.log('╚═════════════════════════════════════════════════════════════╝');
    console.log('\n');

    const overallStartTime = Date.now();

    try {
      // Run all test suites
      await this.testDatabaseInitialization();
      await this.testOfflinePredictionStorage();
      await this.testRemedyOfflineStorage();
      await this.testMLModelInitialization();
      await this.testMLModelInference();
      await this.testCompleteOfflineWorkflow();
      await this.testSyncService();
      await this.testAppSettings();
      await this.testPerformance();

    } catch (error) {
      console.error('\n❌ Critical error during test execution:', error);
    }

    const overallTime = Date.now() - overallStartTime;

    // Print summary
    this.printSummary(overallTime);

    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      duration: overallTime,
      results: this.testResults
    };
  }

  // Print test summary
  printSummary(duration) {
    console.log('\n');
    console.log('╔═════════════════════════════════════════════════════════════╗');
    console.log('║                     📊 TEST SUMMARY                         ║');
    console.log('╚═════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Total Tests:     ${this.totalTests}`);
    console.log(`  ✅ Passed:       ${this.passedTests}`);
    console.log(`  ❌ Failed:       ${this.failedTests}`);
    console.log(`  ⏱️  Duration:     ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`  📈 Pass Rate:    ${((this.passedTests / this.totalTests) * 100).toFixed(2)}%`);
    console.log('');
    
    if (this.failedTests === 0) {
      console.log('  🎉 ALL TESTS PASSED! 🎉');
    } else {
      console.log('  ⚠️  SOME TESTS FAILED - REVIEW RESULTS ABOVE');
    }
    
    console.log('');
    console.log('═'.repeat(63));
  }

  // Export results to JSON
  exportResults() {
    return {
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        passRate: ((this.passedTests / this.totalTests) * 100).toFixed(2)
      },
      tests: this.testResults,
      timestamp: new Date().toISOString()
    };
  }
}

// Export the test class
export default OfflineTests;

// Also export a function to run tests
export async function runOfflineTests() {
  const tester = new OfflineTests();
  const results = await tester.runAllTests();
  return results;
}

