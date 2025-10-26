import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { databaseService } from './databaseService';

class MLService {
  constructor() {
    this.model = null;
    this.modelInfo = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js with React Native platform
      await tf.ready();
      console.log('✅ TensorFlow.js initialized for mobile');

      // Set backend preference for mobile (CPU is often more reliable on mobile)
      const backends = ['webgl', 'cpu'];
      for (const backend of backends) {
        try {
          await tf.setBackend(backend);
          console.log(`✅ Using ${backend} backend`);
          break;
        } catch (error) {
          console.warn(`Failed to set ${backend} backend:`, error);
        }
      }

      // Wait for database to be initialized
      let retries = 0;
      const maxRetries = 10;
      while (!databaseService.isInitialized && retries < maxRetries) {
        console.log(`⏳ Waiting for database initialization... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (!databaseService.isInitialized) {
        throw new Error('Database initialization timeout');
      }

      // Load the default or active model
      await this.loadModel();
      
      this.isInitialized = true;
      console.log('✅ ML Service initialized successfully');
    } catch (error) {
      console.error('❌ ML Service initialization failed:', error);
      throw error;
    }
  }

  async loadModel(modelId) {
    try {
      let localModel = null;

      if (modelId) {
        // Load specific model by ID (implement this if needed)
        throw new Error('Loading specific model by ID not implemented yet');
      } else {
        // Load active model or default model
        localModel = await databaseService.getActiveModel();
        if (!localModel) {
          localModel = await databaseService.getDefaultModel();
        }
      }

      if (!localModel) {
        console.warn('⚠️ No model found in database, creating fallback model');
        // Create a simple fallback model for testing
        return this.createFallbackModel();
      }

      // Dispose of previous model if exists
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }

      // Load model from local path
      console.log(`Loading model from: ${localModel.modelPath}`);
      this.model = await tf.loadLayersModel(localModel.modelPath);

      this.modelInfo = {
        id: localModel.id,
        name: localModel.name,
        version: localModel.version,
        inputShape: localModel.inputShape,
        outputClasses: localModel.outputClasses,
        isLoaded: true,
      };

      console.log(`✅ Model loaded successfully: ${localModel.name} v${localModel.version}`);
    } catch (error) {
      console.error('❌ Failed to load model:', error);
      throw error;
    }
  }

  async predict(imageUri) {
    if (!this.model || !this.modelInfo) {
      throw new Error('Model not loaded. Please initialize ML service first.');
    }

    const startTime = Date.now();

    try {
      // Load and preprocess image
      const preprocessedImage = await this.preprocessImage(imageUri);

      // Run prediction
      const prediction = this.model.predict(preprocessedImage);
      const predictionArray = await prediction.data();

      // Process results
      const results = [];
      const outputClasses = this.modelInfo.outputClasses;

      for (let i = 0; i < predictionArray.length; i++) {
        results.push({
          disease: outputClasses[i] || `Unknown_${i}`,
          confidence: predictionArray[i],
        });
      }

      // Sort by confidence (descending)
      results.sort((a, b) => b.confidence - a.confidence);

      const processingTime = Date.now() - startTime;

      // Clean up tensors
      preprocessedImage.dispose();
      prediction.dispose();

      return {
        predictions: results,
        topPrediction: results[0].disease,
        confidence: results[0].confidence,
        processingTime,
      };
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      throw error;
    }
  }

  async preprocessImage(imageUri) {
    try {
      if (!this.modelInfo) {
        throw new Error('Model info not available');
      }

      const inputShape = this.modelInfo.inputShape;
      const [height, width] = inputShape.slice(1, 3); // Assume shape is [batch, height, width, channels]

      // Create image element for mobile
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            // Convert image to tensor
            let tensor = tf.browser.fromPixels(img);
            
            // Resize image to model input size
            tensor = tf.image.resizeBilinear(tensor, [height, width]);
            
            // Normalize pixel values to [0, 1]
            tensor = tensor.div(255.0);
            
            // Add batch dimension
            tensor = tensor.expandDims(0);
            
            resolve(tensor);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = imageUri;
      });
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      throw error;
    }
  }

  async getModelInfo() {
    return this.modelInfo;
  }

  createFallbackModel() {
    console.log('🔧 Creating fallback model for testing...');
    
    // Create a simple sequential model for testing
    const model = tf.sequential({
      layers: [
        tf.layers.flatten({ inputShape: [224, 224, 3] }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 7, activation: 'softmax' }) // 7 disease classes
      ]
    });

    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    this.modelInfo = {
      id: 'fallback-model',
      name: 'Fallback Test Model',
      version: '1.0.0',
      description: 'Simple fallback model for testing',
      accuracy: 0.0,
      isActive: true,
      inputShape: [1, 224, 224, 3]
    };

    console.log('✅ Fallback model created successfully');
    return model;
  }

  async isModelLoaded() {
    return this.model !== null && this.modelInfo !== null;
  }

  async warmUpModel() {
    if (!this.model || !this.modelInfo) {
      throw new Error('Model not loaded');
    }

    try {
      const inputShape = this.modelInfo.inputShape;
      const dummyInput = tf.zeros([1, ...inputShape.slice(1)]);
      
      // Run a dummy prediction to warm up the model
      const prediction = this.model.predict(dummyInput);
      
      // Clean up
      dummyInput.dispose();
      prediction.dispose();
      
      console.log('✅ Model warmed up successfully');
    } catch (error) {
      console.error('❌ Model warm-up failed:', error);
      throw error;
    }
  }

  async getModelMemoryUsage() {
    return tf.memory();
  }

  async dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    
    this.modelInfo = null;
    this.isInitialized = false;
    
    // Clean up any remaining tensors
    tf.disposeVariables();
    
    console.log('✅ ML Service disposed');
  }

  // Utility method to check if TensorFlow.js is ready
  async checkTensorFlowReady() {
    try {
      await tf.ready();
      return true;
    } catch (error) {
      console.error('TensorFlow.js not ready:', error);
      return false;
    }
  }

  // Get available backends
  getAvailableBackends() {
    return tf.engine().registryFactory.getFactoryMap().map(([name]) => name);
  }

  // Get current backend
  getCurrentBackend() {
    return tf.getBackend();
  }

  // Switch backend
  async switchBackend(backendName) {
    if (backendName !== tf.getBackend()) {
      await tf.setBackend(backendName);
      console.log(`✅ Switched to backend: ${backendName}`);
    }
  }
}

export const mlService = new MLService();
