"""
Model export pipeline for converting trained models to TensorFlow.js format
"""
import os
import json
import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs
from pathlib import Path
import requests
import hashlib
from datetime import datetime

from config import *

class ModelExporter:
    def __init__(self):
        self.model = None
        
    def load_trained_model(self, model_path=None):
        """Load the trained Keras model"""
        if model_path is None:
            model_path = MODEL_SAVE_PATH
            
        if not model_path.exists():
            print(f"❌ Model not found at {model_path}")
            return None
            
        print(f"📥 Loading model from {model_path}")
        self.model = tf.keras.models.load_model(model_path)
        print("✅ Model loaded successfully!")
        return self.model
    
    def optimize_model_for_mobile(self):
        """Apply optimizations for mobile deployment"""
        print("⚡ Optimizing model for mobile...")
        
        if self.model is None:
            print("❌ No model loaded")
            return None
        
        # Convert to concrete function for optimization
        concrete_func = tf.function(lambda x: self.model(x))
        concrete_func = concrete_func.get_concrete_function(
            tf.TensorSpec([None, TRAINING_CONFIG['img_height'], 
                          TRAINING_CONFIG['img_width'], 3], tf.float32)
        )
        
        # Apply graph optimizations
        from tensorflow.python.tools import optimize_for_inference_lib
        
        # Note: For TensorFlow 2.x, we use different optimization techniques
        # The model will be optimized during TensorFlow.js conversion
        
        print("✅ Model optimization prepared")
        return self.model
    
    def export_to_tensorflowjs(self, output_path=None, quantization=True):
        """Export model to TensorFlow.js format"""
        if output_path is None:
            output_path = TENSORFLOWJS_EXPORT_PATH
            
        if self.model is None:
            print("❌ No model loaded")
            return False
            
        print(f"🔄 Exporting model to TensorFlow.js format...")
        print(f"📁 Output path: {output_path}")
        
        # Ensure output directory exists
        output_path = Path(output_path)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Configure export options
        if quantization:
            # Use quantization for smaller model size
            quantization_bytes = 2  # 16-bit quantization
            print(f"🗜️  Applying {quantization_bytes*8}-bit quantization")
        else:
            quantization_bytes = None
            
        try:
            # Export the model
            tfjs.converters.save_keras_model(
                self.model,
                str(output_path),
                quantization_bytes=quantization_bytes,
                skip_op_check=False,
                strip_debug_ops=True
            )
            
            print("✅ Model exported successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Export failed: {e}")
            return False
    
    def create_model_metadata(self, export_path):
        """Create metadata file for the exported model"""
        print("📋 Creating model metadata...")
        
        export_path = Path(export_path)
        
        # Calculate model size
        model_json_path = export_path / 'model.json'
        if model_json_path.exists():
            model_size = model_json_path.stat().st_size
            
            # Add weight files size
            for weight_file in export_path.glob('*.bin'):
                model_size += weight_file.stat().st_size
        else:
            model_size = 0
        
        # Calculate checksums
        checksums = {}
        for file_path in export_path.glob('*'):
            if file_path.is_file():
                with open(file_path, 'rb') as f:
                    file_hash = hashlib.md5(f.read()).hexdigest()
                    checksums[file_path.name] = file_hash
        
        # Get model input/output info
        if self.model:
            input_shape = self.model.input_shape[1:]  # Remove batch dimension
            output_shape = self.model.output_shape[1:]
        else:
            input_shape = [TRAINING_CONFIG['img_height'], TRAINING_CONFIG['img_width'], 3]
            output_shape = [NUM_CLASSES]
        
        # Create comprehensive metadata
        metadata = {
            **EXPORT_CONFIG['metadata'],
            'export_info': {
                'export_date': datetime.now().isoformat(),
                'tensorflow_version': tf.__version__,
                'tensorflowjs_version': tfjs.__version__,
                'model_size_bytes': model_size,
                'quantized': EXPORT_CONFIG['quantization'],
                'optimization': EXPORT_CONFIG['optimization']
            },
            'model_architecture': {
                'input_shape': input_shape,
                'output_shape': output_shape,
                'num_parameters': self.model.count_params() if self.model else None,
                'num_layers': len(self.model.layers) if self.model else None
            },
            'training_config': {
                'epochs_trained': TRAINING_CONFIG['epochs'],
                'batch_size': TRAINING_CONFIG['batch_size'],
                'learning_rate': TRAINING_CONFIG['learning_rate'],
                'data_augmentation': True
            },
            'performance_metrics': {
                'accuracy': None,  # Will be filled after evaluation
                'top_3_accuracy': None,
                'inference_time_ms': None  # Will be measured on device
            },
            'file_checksums': checksums,
            'usage_instructions': {
                'preprocessing': [
                    "Resize image to 224x224 pixels",
                    "Normalize pixel values to [0, 1] range",
                    "Apply ImageNet normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]"
                ],
                'postprocessing': [
                    "Apply softmax to get probabilities",
                    "Get top prediction with highest probability",
                    "Consider predictions with confidence > 0.7 as reliable"
                ]
            }
        }
        
        # Save metadata
        metadata_path = export_path / 'metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        print(f"📄 Metadata saved to {metadata_path}")
        return metadata
    
    def create_sample_inference_code(self, export_path):
        """Create sample JavaScript code for using the model"""
        sample_code = '''
// Sample JavaScript code for using the exported model
// This code can be used in your mobile app

import * as tf from '@tensorflow/tfjs';

class GingerDiseaseDetector {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.classNames = [
      'healthy', 'bacterial_wilt', 'rhizome_rot', 
      'leaf_spot', 'soft_rot', 'yellow_disease', 'root_knot_nematode'
    ];
  }

  async loadModel(modelUrl) {
    try {
      console.log('Loading model...');
      this.model = await tf.loadLayersModel(modelUrl + '/model.json');
      this.isLoaded = true;
      console.log('Model loaded successfully!');
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  preprocessImage(imageElement) {
    return tf.tidy(() => {
      // Convert image to tensor
      let tensor = tf.browser.fromPixels(imageElement);
      
      // Resize to model input size
      tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      
      // Normalize to [0, 1]
      tensor = tensor.div(255.0);
      
      // Apply ImageNet normalization
      const mean = tf.tensor([0.485, 0.456, 0.406]);
      const std = tf.tensor([0.229, 0.224, 0.225]);
      tensor = tensor.sub(mean).div(std);
      
      // Add batch dimension
      return tensor.expandDims(0);
    });
  }

  async predict(imageElement) {
    if (!this.isLoaded) {
      throw new Error('Model not loaded yet');
    }

    const startTime = performance.now();
    
    // Preprocess image
    const preprocessed = this.preprocessImage(imageElement);
    
    // Run inference
    const predictions = this.model.predict(preprocessed);
    const probabilities = await predictions.data();
    
    // Clean up tensors
    preprocessed.dispose();
    predictions.dispose();
    
    const inferenceTime = performance.now() - startTime;
    
    // Process results
    const results = this.classNames.map((className, index) => ({
      disease: className,
      confidence: probabilities[index]
    }));
    
    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);
    
    return {
      predictions: results,
      topPrediction: results[0].disease,
      confidence: results[0].confidence,
      processingTime: Math.round(inferenceTime)
    };
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isLoaded = false;
    }
  }
}

// Usage example:
// const detector = new GingerDiseaseDetector();
// await detector.loadModel('/path/to/model');
// const result = await detector.predict(imageElement);
// console.log('Detected:', result.topPrediction, 'Confidence:', result.confidence);
'''
        
        sample_path = Path(export_path) / 'sample_usage.js'
        with open(sample_path, 'w') as f:
            f.write(sample_code)
            
        print(f"📝 Sample code saved to {sample_path}")
    
    def validate_export(self, export_path):
        """Validate the exported model"""
        print("✅ Validating exported model...")
        
        export_path = Path(export_path)
        
        # Check required files
        required_files = ['model.json']
        for file_name in required_files:
            file_path = export_path / file_name
            if not file_path.exists():
                print(f"❌ Missing required file: {file_name}")
                return False
        
        # Check weight files
        weight_files = list(export_path.glob('*.bin'))
        if not weight_files:
            print("❌ No weight files found")
            return False
            
        print(f"✅ Found {len(weight_files)} weight files")
        
        # Validate model.json structure
        try:
            with open(export_path / 'model.json', 'r') as f:
                model_json = json.load(f)
                
            if 'modelTopology' not in model_json:
                print("❌ Invalid model.json structure")
                return False
                
            print("✅ Model structure validated")
            
        except Exception as e:
            print(f"❌ Error validating model.json: {e}")
            return False
        
        print("✅ Export validation passed!")
        return True
    
    def upload_to_backend(self, export_path, backend_url=None):
        """Upload the exported model to the backend API"""
        if backend_url is None:
            backend_url = API_CONFIG['backend_url']
            
        print(f"🚀 Uploading model to backend: {backend_url}")
        
        # This is a placeholder - implement based on your backend API
        # You would typically:
        # 1. Authenticate with admin credentials
        # 2. Create a new model entry
        # 3. Upload the model files
        # 4. Update model metadata
        
        print("ℹ️  Backend upload not implemented yet")
        print("📝 Manual steps:")
        print(f"   1. Copy files from {export_path} to your backend")
        print("   2. Use the admin panel to register the new model")
        print("   3. Update model metadata in the database")

def main():
    """Main export pipeline"""
    print("🚀 Starting Model Export Pipeline")
    
    exporter = ModelExporter()
    
    # Step 1: Load trained model
    model = exporter.load_trained_model()
    if model is None:
        print("❌ Cannot proceed without a trained model")
        print("📝 Please train a model first using model_training.py")
        return
    
    # Step 2: Optimize for mobile
    exporter.optimize_model_for_mobile()
    
    # Step 3: Export to TensorFlow.js
    success = exporter.export_to_tensorflowjs(
        TENSORFLOWJS_EXPORT_PATH,
        quantization=EXPORT_CONFIG['quantization']
    )
    
    if not success:
        print("❌ Export failed")
        return
    
    # Step 4: Create metadata
    metadata = exporter.create_model_metadata(TENSORFLOWJS_EXPORT_PATH)
    
    # Step 5: Create sample code
    exporter.create_sample_inference_code(TENSORFLOWJS_EXPORT_PATH)
    
    # Step 6: Validate export
    if not exporter.validate_export(TENSORFLOWJS_EXPORT_PATH):
        print("❌ Export validation failed")
        return
    
    # Step 7: Upload to backend (optional)
    # exporter.upload_to_backend(TENSORFLOWJS_EXPORT_PATH)
    
    print("\n✅ Model export completed successfully!")
    print(f"📁 Exported model location: {TENSORFLOWJS_EXPORT_PATH}")
    print(f"📄 Model metadata: {TENSORFLOWJS_EXPORT_PATH / 'metadata.json'}")
    print(f"📝 Sample usage code: {TENSORFLOWJS_EXPORT_PATH / 'sample_usage.js'}")
    
    print("\n🔄 Next steps:")
    print("1. Copy the exported model files to your backend's model storage")
    print("2. Update the backend API to serve the new model")
    print("3. Test the model in your mobile app")
    print("4. Monitor model performance and retrain if needed")

if __name__ == "__main__":
    main()
