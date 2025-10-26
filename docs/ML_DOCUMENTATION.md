# 🤖 GingerlyAI Machine Learning Documentation

## 📋 Overview

This comprehensive guide covers the machine learning pipeline of GingerlyAI, from data collection and preprocessing to model training, evaluation, deployment, and monitoring. The system uses Convolutional Neural Networks (CNNs) to detect diseases in ginger plants from smartphone images.

---

## 🎯 Problem Definition

### **Objective**
Develop a mobile-optimized deep learning model that can accurately classify ginger plant diseases from low-resolution smartphone images, enabling farmers to make informed treatment decisions even in areas with limited internet connectivity.

### **Disease Classes**
The model classifies images into 7 categories:
1. **Healthy** - No visible disease symptoms
2. **Bacterial Wilt** - Caused by Ralstonia solanacearum
3. **Rhizome Rot** - Fungal infection of underground parts
4. **Leaf Spot** - Various fungal pathogens
5. **Soft Rot** - Bacterial/fungal decay
6. **Yellow Disease** - Viral infection
7. **Root Knot Nematode** - Parasitic worm damage

### **Technical Requirements**
- **Input**: RGB images (224×224 pixels)
- **Output**: Disease classification with confidence scores
- **Deployment**: TensorFlow.js for mobile inference
- **Performance**: >90% accuracy, <500ms inference time
- **Size**: <50MB model for mobile deployment

---

## 📊 Dataset Specification

### **Current Setup Status** ✅ READY
- **Dataset Structure**: Configured with 7 disease classes
- **Image Directories**: `ml-training/data/raw/ginger_dataset/`
- **Preprocessing Pipeline**: Ready for data processing
- **Sample Data**: Available for testing and development
- **ML Environment**: TensorFlow 2.20.0 installed and configured

### **Data Collection Guidelines**

#### **Image Quality Standards**
```python
# Image specifications
IMAGE_SPECS = {
    'resolution': {
        'minimum': (224, 224),
        'recommended': (512, 512),
        'maximum': (1024, 1024)
    },
    'format': ['JPEG', 'PNG'],
    'quality': {
        'minimum_jpeg_quality': 75,
        'recommended': 90
    },
    'lighting': {
        'preferred': 'natural daylight',
        'acceptable': 'artificial white light',
        'avoid': 'direct flash, shadows'
    }
}
```

#### **Data Collection Protocol**
```python
# Sampling strategy per disease class
SAMPLING_REQUIREMENTS = {
    'healthy': {
        'minimum_samples': 2000,
        'growth_stages': ['seedling', 'vegetative', 'mature'],
        'view_angles': ['top', 'side', 'close-up']
    },
    'bacterial_wilt': {
        'minimum_samples': 1500,
        'severity_levels': ['early', 'moderate', 'severe'],
        'plant_parts': ['leaves', 'stems', 'whole_plant']
    },
    'rhizome_rot': {
        'minimum_samples': 1200,
        'exposure_types': ['surface_symptoms', 'cross_section'],
        'decay_stages': ['initial', 'advanced']
    },
    # ... similar specs for other diseases
}
```

### **Dataset Structure**
```
dataset/
├── raw/
│   ├── healthy/
│   ├── bacterial_wilt/
│   ├── rhizome_rot/
│   ├── leaf_spot/
│   ├── soft_rot/
│   ├── yellow_disease/
│   └── root_knot_nematode/
├── processed/
│   ├── train/ (70%)
│   ├── validation/ (15%)
│   └── test/ (15%)
└── metadata/
    ├── annotations.csv
    ├── image_quality_metrics.csv
    └── collection_metadata.json
```

---

## 🔄 Data Preprocessing Pipeline

### **Image Preprocessing Steps**

```python
import cv2
import numpy as np
from albumentations import (
    Compose, Rotate, RandomBrightnessContrast, 
    HueSaturationValue, GaussNoise, HorizontalFlip
)

class ImagePreprocessor:
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size
        self.train_transforms = self._get_train_transforms()
        self.val_transforms = self._get_val_transforms()
    
    def _get_train_transforms(self):
        """Training augmentation pipeline"""
        return Compose([
            # Geometric transformations
            Rotate(limit=30, p=0.7),
            HorizontalFlip(p=0.5),
            
            # Color transformations
            RandomBrightnessContrast(
                brightness_limit=0.2,
                contrast_limit=0.2,
                p=0.6
            ),
            HueSaturationValue(
                hue_shift_limit=10,
                sat_shift_limit=15,
                val_shift_limit=10,
                p=0.6
            ),
            
            # Noise and quality degradation
            GaussNoise(var_limit=(10.0, 50.0), p=0.4),
            
            # Final normalization
            Normalize(
                mean=[0.485, 0.456, 0.406],  # ImageNet standards
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def _get_val_transforms(self):
        """Validation preprocessing pipeline"""
        return Compose([
            Resize(*self.target_size),
            Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def preprocess_image(self, image_path, is_training=True):
        """Preprocess single image"""
        # Load image
        image = cv2.imread(str(image_path))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Apply transformations
        transforms = self.train_transforms if is_training else self.val_transforms
        transformed = transforms(image=image)
        
        return transformed['image']
```

### **Data Quality Assessment**

```python
class DataQualityAssessment:
    def __init__(self):
        self.quality_metrics = {}
    
    def assess_image_quality(self, image_path):
        """Assess individual image quality"""
        image = cv2.imread(str(image_path))
        
        metrics = {
            'resolution': image.shape[:2],
            'blur_score': self._calculate_blur_score(image),
            'brightness': np.mean(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)),
            'contrast': np.std(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)),
            'file_size': os.path.getsize(image_path)
        }
        
        return metrics
    
    def _calculate_blur_score(self, image):
        """Calculate image blur using Laplacian variance"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()
    
    def filter_low_quality_images(self, dataset_path, thresholds):
        """Remove images below quality thresholds"""
        low_quality_images = []
        
        for image_path in Path(dataset_path).rglob('*.jpg'):
            metrics = self.assess_image_quality(image_path)
            
            # Apply quality filters
            if (metrics['blur_score'] < thresholds['min_blur'] or
                metrics['brightness'] < thresholds['min_brightness'] or
                metrics['contrast'] < thresholds['min_contrast']):
                low_quality_images.append(image_path)
        
        return low_quality_images
```

---

## 🏗️ Model Architecture

### **Base Architecture Selection**

```python
import tensorflow as tf
from tensorflow.keras import layers, applications, Model

class GingerDiseaseModel:
    def __init__(self, num_classes=7, input_shape=(224, 224, 3)):
        self.num_classes = num_classes
        self.input_shape = input_shape
        self.model = None
    
    def build_model(self, architecture='EfficientNetB0', pretrained=True):
        """Build CNN model with specified architecture"""
        
        # Input layer
        inputs = layers.Input(shape=self.input_shape)
        
        # Data augmentation (applied during training only)
        x = layers.RandomFlip("horizontal")(inputs)
        x = layers.RandomRotation(0.1)(x)
        x = layers.RandomZoom(0.1)(x)
        
        # Base model selection
        if architecture == 'EfficientNetB0':
            base_model = applications.EfficientNetB0(
                weights='imagenet' if pretrained else None,
                include_top=False,
                input_shape=self.input_shape
            )
            preprocess_func = applications.efficientnet.preprocess_input
            
        elif architecture == 'MobileNetV2':
            base_model = applications.MobileNetV2(
                weights='imagenet' if pretrained else None,
                include_top=False,
                input_shape=self.input_shape
            )
            preprocess_func = applications.mobilenet_v2.preprocess_input
            
        elif architecture == 'ResNet50':
            base_model = applications.ResNet50(
                weights='imagenet' if pretrained else None,
                include_top=False,
                input_shape=self.input_shape
            )
            preprocess_func = applications.resnet50.preprocess_input
        
        # Preprocessing
        x = preprocess_func(x)
        
        # Feature extraction
        x = base_model(x, training=False)
        
        # Global pooling
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        
        # Classification head
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(
            512, 
            activation='relu',
            kernel_regularizer=tf.keras.regularizers.l2(0.001)
        )(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        
        x = layers.Dense(
            256, 
            activation='relu',
            kernel_regularizer=tf.keras.regularizers.l2(0.001)
        )(x)
        x = layers.Dropout(0.2)(x)
        
        # Output layer
        outputs = layers.Dense(
            self.num_classes, 
            activation='softmax',
            name='disease_prediction'
        )(x)
        
        # Create model
        self.model = Model(inputs, outputs)
        
        return self.model
```

### **Model Compilation & Training Configuration**

```python
def compile_model(self, optimizer_config):
    """Compile model with specified optimizer and loss"""
    
    # Optimizer selection
    if optimizer_config['type'] == 'adam':
        optimizer = tf.keras.optimizers.Adam(
            learning_rate=optimizer_config['learning_rate'],
            beta_1=optimizer_config.get('beta_1', 0.9),
            beta_2=optimizer_config.get('beta_2', 0.999)
        )
    elif optimizer_config['type'] == 'sgd':
        optimizer = tf.keras.optimizers.SGD(
            learning_rate=optimizer_config['learning_rate'],
            momentum=optimizer_config.get('momentum', 0.9)
        )
    
    # Compile model
    self.model.compile(
        optimizer=optimizer,
        loss='sparse_categorical_crossentropy',
        metrics=[
            'accuracy',
            tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy'),
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall')
        ]
    )
```

---

## 🎓 Training Pipeline

### **Training Configuration**

```python
TRAINING_CONFIG = {
    # Data parameters
    'batch_size': 32,
    'epochs': 100,
    'validation_split': 0.2,
    
    # Optimization parameters
    'learning_rate': 0.001,
    'optimizer': 'adam',
    'loss_function': 'sparse_categorical_crossentropy',
    
    # Regularization
    'dropout_rate': 0.5,
    'l2_regularization': 0.001,
    'early_stopping_patience': 10,
    
    # Learning rate scheduling
    'reduce_lr_patience': 5,
    'reduce_lr_factor': 0.5,
    'min_lr': 1e-7,
    
    # Model selection
    'base_architecture': 'EfficientNetB0',
    'pretrained_weights': True,
    'freeze_base_layers': True,
    'fine_tune_from_layer': 100
}
```

### **Training Callbacks**

```python
def create_callbacks(self, model_name, log_dir):
    """Create training callbacks for monitoring and control"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    callbacks = [
        # Early stopping
        tf.keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=TRAINING_CONFIG['early_stopping_patience'],
            restore_best_weights=True,
            verbose=1
        ),
        
        # Learning rate reduction
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=TRAINING_CONFIG['reduce_lr_factor'],
            patience=TRAINING_CONFIG['reduce_lr_patience'],
            min_lr=TRAINING_CONFIG['min_lr'],
            verbose=1
        ),
        
        # Model checkpointing
        tf.keras.callbacks.ModelCheckpoint(
            filepath=f'models/{model_name}_best_{timestamp}.h5',
            monitor='val_accuracy',
            save_best_only=True,
            save_weights_only=False,
            verbose=1
        ),
        
        # TensorBoard logging
        tf.keras.callbacks.TensorBoard(
            log_dir=f'{log_dir}/{timestamp}',
            histogram_freq=1,
            write_graph=True,
            write_images=True,
            update_freq='epoch'
        ),
        
        # CSV logging
        tf.keras.callbacks.CSVLogger(
            f'logs/training_log_{timestamp}.csv',
            append=False
        ),
        
        # Custom metrics callback
        MetricsCallback(log_dir=log_dir)
    ]
    
    return callbacks

class MetricsCallback(tf.keras.callbacks.Callback):
    """Custom callback for detailed metrics logging"""
    
    def __init__(self, log_dir):
        super().__init__()
        self.log_dir = log_dir
    
    def on_epoch_end(self, epoch, logs=None):
        """Log custom metrics at end of each epoch"""
        
        # Calculate per-class metrics
        y_pred = self.model.predict(self.validation_data[0])
        y_true = self.validation_data[1]
        
        # Log class-wise performance
        from sklearn.metrics import classification_report
        report = classification_report(
            y_true, 
            np.argmax(y_pred, axis=1),
            target_names=DISEASE_CLASSES,
            output_dict=True
        )
        
        # Save detailed metrics
        metrics_path = f"{self.log_dir}/epoch_{epoch}_metrics.json"
        with open(metrics_path, 'w') as f:
            json.dump(report, f, indent=2)
```

### **Transfer Learning Strategy**

```python
def apply_transfer_learning(self, base_model, strategy='gradual_unfreezing'):
    """Apply transfer learning strategy"""
    
    if strategy == 'feature_extraction':
        # Freeze all base model layers
        base_model.trainable = False
        
    elif strategy == 'fine_tuning':
        # Unfreeze all layers
        base_model.trainable = True
        
    elif strategy == 'gradual_unfreezing':
        # Gradually unfreeze layers during training
        total_layers = len(base_model.layers)
        unfreeze_from = int(total_layers * 0.8)  # Unfreeze top 20%
        
        for layer in base_model.layers[:unfreeze_from]:
            layer.trainable = False
        for layer in base_model.layers[unfreeze_from:]:
            layer.trainable = True
    
    return base_model

def train_with_progressive_unfreezing(self, train_data, val_data, epochs_per_stage=20):
    """Progressive unfreezing training strategy"""
    
    stages = [
        {'unfreeze_ratio': 0.0, 'lr': 0.001},   # Feature extraction
        {'unfreeze_ratio': 0.2, 'lr': 0.0005},  # Partial fine-tuning
        {'unfreeze_ratio': 0.5, 'lr': 0.0001},  # More fine-tuning
        {'unfreeze_ratio': 1.0, 'lr': 0.00005}  # Full fine-tuning
    ]
    
    for stage, config in enumerate(stages):
        print(f"Training Stage {stage + 1}: Unfreezing {config['unfreeze_ratio']*100}% of layers")
        
        # Adjust layer freezing
        self._adjust_layer_freezing(config['unfreeze_ratio'])
        
        # Update learning rate
        self.model.optimizer.learning_rate = config['lr']
        
        # Train for this stage
        history = self.model.fit(
            train_data,
            validation_data=val_data,
            epochs=epochs_per_stage,
            callbacks=self.create_callbacks(f'stage_{stage}', 'logs'),
            verbose=1
        )
```

---

## 📈 Model Evaluation

### **Comprehensive Evaluation Pipeline**

```python
class ModelEvaluator:
    def __init__(self, model, test_data, class_names):
        self.model = model
        self.test_data = test_data
        self.class_names = class_names
        
    def evaluate_comprehensive(self):
        """Comprehensive model evaluation"""
        
        results = {}
        
        # Basic metrics
        results['basic_metrics'] = self._evaluate_basic_metrics()
        
        # Per-class analysis
        results['per_class_metrics'] = self._evaluate_per_class()
        
        # Confusion matrix
        results['confusion_matrix'] = self._generate_confusion_matrix()
        
        # ROC curves and AUC
        results['roc_analysis'] = self._evaluate_roc_curves()
        
        # Calibration analysis
        results['calibration'] = self._evaluate_calibration()
        
        # Error analysis
        results['error_analysis'] = self._analyze_errors()
        
        # Performance vs confidence
        results['confidence_analysis'] = self._analyze_confidence()
        
        return results
    
    def _evaluate_basic_metrics(self):
        """Calculate basic performance metrics"""
        
        test_loss, test_accuracy, test_top3, test_precision, test_recall = \
            self.model.evaluate(self.test_data, verbose=0)
        
        # F1 score calculation
        y_pred_proba = self.model.predict(self.test_data)
        y_pred = np.argmax(y_pred_proba, axis=1)
        y_true = self.test_data.labels
        
        f1_macro = f1_score(y_true, y_pred, average='macro')
        f1_weighted = f1_score(y_true, y_pred, average='weighted')
        
        return {
            'accuracy': test_accuracy,
            'top_3_accuracy': test_top3,
            'precision': test_precision,
            'recall': test_recall,
            'f1_macro': f1_macro,
            'f1_weighted': f1_weighted,
            'loss': test_loss
        }
    
    def _evaluate_per_class(self):
        """Per-class performance analysis"""
        
        y_pred_proba = self.model.predict(self.test_data)
        y_pred = np.argmax(y_pred_proba, axis=1)
        y_true = self.test_data.labels
        
        # Classification report
        report = classification_report(
            y_true, y_pred, 
            target_names=self.class_names,
            output_dict=True
        )
        
        # Add sample count per class
        unique, counts = np.unique(y_true, return_counts=True)
        class_distribution = dict(zip(unique, counts))
        
        for i, class_name in enumerate(self.class_names):
            if str(i) in report:
                report[str(i)]['sample_count'] = class_distribution.get(i, 0)
        
        return report
    
    def _analyze_confidence(self):
        """Analyze model confidence vs accuracy"""
        
        y_pred_proba = self.model.predict(self.test_data)
        y_pred = np.argmax(y_pred_proba, axis=1)
        y_true = self.test_data.labels
        
        # Confidence scores (max probability)
        confidences = np.max(y_pred_proba, axis=1)
        
        # Bin by confidence levels
        confidence_bins = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        bin_accuracies = []
        bin_counts = []
        
        for i in range(len(confidence_bins) - 1):
            bin_mask = (confidences >= confidence_bins[i]) & (confidences < confidence_bins[i+1])
            if np.sum(bin_mask) > 0:
                bin_accuracy = np.mean(y_true[bin_mask] == y_pred[bin_mask])
                bin_accuracies.append(bin_accuracy)
                bin_counts.append(np.sum(bin_mask))
            else:
                bin_accuracies.append(0)
                bin_counts.append(0)
        
        return {
            'confidence_bins': confidence_bins[:-1],
            'bin_accuracies': bin_accuracies,
            'bin_counts': bin_counts,
            'overall_confidence_accuracy_correlation': 
                np.corrcoef(confidences, y_true == y_pred)[0, 1]
        }
```

### **Performance Benchmarking**

```python
def benchmark_model_performance(self):
    """Benchmark model performance for mobile deployment"""
    
    # Inference time testing
    inference_times = []
    dummy_input = np.random.random((1, 224, 224, 3))
    
    # Warm-up runs
    for _ in range(10):
        self.model.predict(dummy_input)
    
    # Actual timing
    for _ in range(100):
        start_time = time.time()
        _ = self.model.predict(dummy_input)
        inference_times.append((time.time() - start_time) * 1000)  # ms
    
    # Memory usage
    model_size = self.model.count_params() * 4 / (1024 * 1024)  # MB (float32)
    
    # Model complexity
    flops = self._calculate_flops()
    
    benchmark_results = {
        'inference_time': {
            'mean_ms': np.mean(inference_times),
            'std_ms': np.std(inference_times),
            'p95_ms': np.percentile(inference_times, 95),
            'p99_ms': np.percentile(inference_times, 99)
        },
        'model_size_mb': model_size,
        'parameter_count': self.model.count_params(),
        'flops': flops,
        'mobile_readiness': {
            'size_acceptable': model_size < 50,  # MB
            'speed_acceptable': np.mean(inference_times) < 500,  # ms
            'accuracy_acceptable': self.test_accuracy > 0.90
        }
    }
    
    return benchmark_results
```

---

## 🚀 Model Export & Deployment

### **TensorFlow.js Conversion**

```python
import tensorflowjs as tfjs

class ModelExporter:
    def __init__(self, trained_model):
        self.model = trained_model
        
    def export_for_mobile(self, output_path, optimization_level='speed'):
        """Export model for mobile deployment"""
        
        print("🔄 Optimizing model for mobile deployment...")
        
        # Model optimization
        optimized_model = self._optimize_model(optimization_level)
        
        # Convert to TensorFlow.js format
        conversion_config = {
            'quantization_bytes': 2,  # 16-bit quantization
            'skip_op_check': False,
            'strip_debug_ops': True,
            'weight_shard_size_bytes': 4 * 1024 * 1024  # 4MB shards
        }
        
        tfjs.converters.save_keras_model(
            optimized_model,
            output_path,
            **conversion_config
        )
        
        # Generate metadata
        metadata = self._generate_metadata(output_path)
        
        # Create usage documentation
        self._create_usage_docs(output_path)
        
        print(f"✅ Model exported to {output_path}")
        return metadata
    
    def _optimize_model(self, optimization_level):
        """Apply model optimization techniques"""
        
        if optimization_level == 'speed':
            # Optimize for inference speed
            return self._speed_optimization()
        elif optimization_level == 'size':
            # Optimize for model size
            return self._size_optimization()
        else:
            return self.model
    
    def _speed_optimization(self):
        """Optimize model for inference speed"""
        
        # Convert to TensorFlow Lite format first for optimization
        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Convert back to Keras model
        tflite_model = converter.convert()
        
        # Note: In practice, you'd use the TFLite model directly
        # This is simplified for demonstration
        return self.model
    
    def _generate_metadata(self, output_path):
        """Generate comprehensive model metadata"""
        
        metadata = {
            'model_info': {
                'name': 'GingerlyAI Disease Detector',
                'version': '1.0.0',
                'description': 'CNN model for ginger disease detection',
                'created_at': datetime.now().isoformat(),
                'framework': 'TensorFlow.js',
                'input_shape': [224, 224, 3],
                'output_classes': DISEASE_CLASSES
            },
            'performance': {
                'accuracy': 0.92,  # Update with actual value
                'top_3_accuracy': 0.98,
                'inference_time_ms': 150,
                'model_size_mb': 25
            },
            'preprocessing': {
                'normalization': 'ImageNet standard',
                'mean': [0.485, 0.456, 0.406],
                'std': [0.229, 0.224, 0.225],
                'resize_method': 'bilinear'
            },
            'usage_instructions': {
                'input_format': 'RGB image tensor',
                'output_format': 'Probability distribution over classes',
                'confidence_threshold': 0.7,
                'recommended_image_size': [224, 224]
            }
        }
        
        # Save metadata
        with open(f"{output_path}/metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return metadata
    
    def _create_usage_docs(self, output_path):
        """Create JavaScript usage documentation"""
        
        js_code = '''
// GingerlyAI Model Usage Example
import * as tf from '@tensorflow/tfjs';

class GingerDiseaseDetector {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.classes = [
      'healthy', 'bacterial_wilt', 'rhizome_rot',
      'leaf_spot', 'soft_rot', 'yellow_disease', 'root_knot_nematode'
    ];
  }

  async loadModel(modelUrl) {
    try {
      console.log('Loading GingerlyAI model...');
      this.model = await tf.loadLayersModel(modelUrl + '/model.json');
      this.isLoaded = true;
      console.log('Model loaded successfully!');
      
      // Warm up the model
      await this.warmUp();
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  async warmUp() {
    // Run a dummy prediction to warm up the model
    const dummyInput = tf.zeros([1, 224, 224, 3]);
    const prediction = this.model.predict(dummyInput);
    prediction.dispose();
    dummyInput.dispose();
  }

  preprocessImage(imageElement) {
    return tf.tidy(() => {
      // Convert to tensor
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
      throw new Error('Model not loaded');
    }

    const startTime = performance.now();

    try {
      // Preprocess image
      const preprocessed = this.preprocessImage(imageElement);
      
      // Run prediction
      const prediction = this.model.predict(preprocessed);
      const probabilities = await prediction.data();
      
      // Process results
      const results = this.classes.map((className, index) => ({
        disease: className,
        confidence: probabilities[index]
      }));
      
      // Sort by confidence
      results.sort((a, b) => b.confidence - a.confidence);
      
      const processingTime = performance.now() - startTime;
      
      // Clean up
      preprocessed.dispose();
      prediction.dispose();
      
      return {
        predictions: results,
        topPrediction: results[0].disease,
        confidence: results[0].confidence,
        processingTime: Math.round(processingTime)
      };
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  getRecommendedActions(prediction) {
    const actions = {
      'healthy': 'Continue regular care and monitoring',
      'bacterial_wilt': 'Remove infected plants, improve drainage, apply bactericide',
      'rhizome_rot': 'Improve soil drainage, remove affected rhizomes, fungicide treatment',
      'leaf_spot': 'Apply fungicide, improve air circulation, remove affected leaves',
      'soft_rot': 'Improve ventilation, reduce humidity, apply fungicide',
      'yellow_disease': 'Remove infected plants, control vector insects',
      'root_knot_nematode': 'Soil treatment, crop rotation, resistant varieties'
    };
    
    return actions[prediction] || 'Consult agricultural expert';
  }
}

// Usage example:
// const detector = new GingerDiseaseDetector();
// await detector.loadModel('/path/to/model');
// const result = await detector.predict(imageElement);
// console.log('Disease detected:', result.topPrediction);
'''
        
        with open(f"{output_path}/usage_example.js", 'w') as f:
            f.write(js_code)
```

---

## 📊 Model Monitoring & Maintenance

### **Production Monitoring**

```python
class ModelMonitor:
    def __init__(self, model_endpoint, database_connection):
        self.endpoint = model_endpoint
        self.db = database_connection
        
    def log_prediction(self, input_data, prediction_result, user_feedback=None):
        """Log prediction for monitoring and retraining"""
        
        prediction_log = {
            'timestamp': datetime.now(),
            'input_hash': hashlib.md5(str(input_data).encode()).hexdigest(),
            'prediction': prediction_result['topPrediction'],
            'confidence': prediction_result['confidence'],
            'processing_time': prediction_result['processingTime'],
            'user_feedback': user_feedback,
            'model_version': self.get_current_model_version()
        }
        
        # Store in monitoring database
        self.db.predictions.insert_one(prediction_log)
    
    def analyze_model_drift(self, time_window_days=30):
        """Analyze model performance drift over time"""
        
        # Get recent predictions
        cutoff_date = datetime.now() - timedelta(days=time_window_days)
        recent_predictions = self.db.predictions.find({
            'timestamp': {'$gte': cutoff_date}
        })
        
        # Calculate metrics
        confidence_trend = []
        accuracy_trend = []
        
        for prediction in recent_predictions:
            confidence_trend.append(prediction['confidence'])
            
            # If user feedback available, calculate accuracy
            if prediction.get('user_feedback'):
                is_correct = prediction['user_feedback']['is_correct']
                accuracy_trend.append(1 if is_correct else 0)
        
        drift_analysis = {
            'avg_confidence': np.mean(confidence_trend) if confidence_trend else 0,
            'confidence_std': np.std(confidence_trend) if confidence_trend else 0,
            'accuracy_rate': np.mean(accuracy_trend) if accuracy_trend else None,
            'sample_count': len(confidence_trend),
            'drift_detected': self._detect_drift(confidence_trend, accuracy_trend)
        }
        
        return drift_analysis
    
    def _detect_drift(self, confidence_trend, accuracy_trend):
        """Simple drift detection based on confidence and accuracy trends"""
        
        # Confidence drift: significant decrease in average confidence
        if len(confidence_trend) > 100:
            recent_confidence = np.mean(confidence_trend[-50:])
            baseline_confidence = np.mean(confidence_trend[:-50])
            confidence_drop = baseline_confidence - recent_confidence
            
            if confidence_drop > 0.1:  # 10% drop in confidence
                return True
        
        # Accuracy drift: if user feedback shows declining accuracy
        if len(accuracy_trend) > 50:
            recent_accuracy = np.mean(accuracy_trend[-25:])
            if recent_accuracy < 0.8:  # Below 80% accuracy
                return True
        
        return False
    
    def generate_retraining_recommendation(self):
        """Generate recommendation for model retraining"""
        
        drift_analysis = self.analyze_model_drift()
        model_age_days = self._get_model_age_days()
        
        should_retrain = False
        reasons = []
        
        # Check drift
        if drift_analysis['drift_detected']:
            should_retrain = True
            reasons.append("Performance drift detected")
        
        # Check model age
        if model_age_days > 90:  # 3 months
            should_retrain = True
            reasons.append(f"Model is {model_age_days} days old")
        
        # Check data volume
        new_data_count = self._count_new_training_data()
        if new_data_count > 1000:
            should_retrain = True
            reasons.append(f"{new_data_count} new training samples available")
        
        return {
            'should_retrain': should_retrain,
            'reasons': reasons,
            'urgency': 'high' if drift_analysis['drift_detected'] else 'medium',
            'recommended_timeline': '1 week' if should_retrain else 'next quarter'
        }
```

### **Continuous Learning Pipeline**

```python
class ContinuousLearningPipeline:
    def __init__(self, base_model_path, data_source):
        self.base_model_path = base_model_path
        self.data_source = data_source
        
    def incremental_training(self, new_data_batch, validation_data):
        """Perform incremental training with new data"""
        
        # Load current model
        current_model = tf.keras.models.load_model(self.base_model_path)
        
        # Prepare new data
        new_train_data = self._prepare_training_data(new_data_batch)
        
        # Create training configuration for incremental learning
        incremental_config = {
            'epochs': 5,  # Few epochs for incremental updates
            'learning_rate': 0.0001,  # Lower learning rate
            'batch_size': 16,
            'early_stopping_patience': 3
        }
        
        # Set lower learning rate for fine-tuning
        current_model.optimizer.learning_rate = incremental_config['learning_rate']
        
        # Train on new data
        history = current_model.fit(
            new_train_data,
            validation_data=validation_data,
            epochs=incremental_config['epochs'],
            batch_size=incremental_config['batch_size'],
            callbacks=[
                tf.keras.callbacks.EarlyStopping(
                    monitor='val_accuracy',
                    patience=incremental_config['early_stopping_patience'],
                    restore_best_weights=True
                )
            ]
        )
        
        # Evaluate on validation set
        val_metrics = current_model.evaluate(validation_data)
        
        # Save updated model if performance is maintained
        if val_metrics[1] >= 0.90:  # Accuracy threshold
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            updated_model_path = f"models/updated_model_{timestamp}.h5"
            current_model.save(updated_model_path)
            
            return {
                'success': True,
                'model_path': updated_model_path,
                'metrics': dict(zip(current_model.metrics_names, val_metrics)),
                'training_history': history.history
            }
        else:
            return {
                'success': False,
                'reason': 'Performance degradation detected',
                'metrics': dict(zip(current_model.metrics_names, val_metrics))
            }
```

---

## 🔬 Research & Future Improvements

### **Advanced Techniques**

#### **1. Multi-Scale Feature Fusion**
```python
def build_multiscale_model(self, input_shape=(224, 224, 3)):
    """Build model with multi-scale feature fusion"""
    
    inputs = layers.Input(shape=input_shape)
    
    # Multiple scale branches
    scale_1 = tf.image.resize(inputs, [224, 224])  # Original
    scale_2 = tf.image.resize(inputs, [112, 112])  # Half size
    scale_3 = tf.image.resize(inputs, [56, 56])    # Quarter size
    
    # Feature extraction for each scale
    features_1 = self._extract_features(scale_1, 'scale_1')
    features_2 = self._extract_features(scale_2, 'scale_2')
    features_3 = self._extract_features(scale_3, 'scale_3')
    
    # Resize features to same spatial dimensions
    features_2_up = layers.UpSampling2D(2)(features_2)
    features_3_up = layers.UpSampling2D(4)(features_3)
    
    # Fuse features
    fused_features = layers.Concatenate()([features_1, features_2_up, features_3_up])
    
    # Final classification
    x = layers.GlobalAveragePooling2D()(fused_features)
    outputs = layers.Dense(self.num_classes, activation='softmax')(x)
    
    return tf.keras.Model(inputs, outputs)
```

#### **2. Attention Mechanisms**
```python
def spatial_attention_block(self, input_features):
    """Spatial attention mechanism"""
    
    # Global average and max pooling
    avg_pool = layers.GlobalAveragePooling2D(keepdims=True)(input_features)
    max_pool = layers.GlobalMaxPooling2D(keepdims=True)(input_features)
    
    # Attention computation
    attention = layers.Concatenate()([avg_pool, max_pool])
    attention = layers.Conv2D(1, 7, padding='same', activation='sigmoid')(attention)
    
    # Apply attention
    attended_features = layers.Multiply()([input_features, attention])
    
    return attended_features
```

#### **3. Uncertainty Estimation**
```python
class BayesianCNN(tf.keras.Model):
    """CNN with uncertainty estimation using Monte Carlo Dropout"""
    
    def __init__(self, num_classes):
        super().__init__()
        self.num_classes = num_classes
        self.backbone = self._build_backbone()
        
    def call(self, inputs, training=None):
        return self.backbone(inputs, training=training)
    
    def predict_with_uncertainty(self, x, num_samples=100):
        """Predict with uncertainty estimation"""
        
        predictions = []
        
        # Enable dropout during inference
        for _ in range(num_samples):
            pred = self(x, training=True)
            predictions.append(pred.numpy())
        
        predictions = np.array(predictions)
        
        # Calculate statistics
        mean_pred = np.mean(predictions, axis=0)
        std_pred = np.std(predictions, axis=0)
        
        # Predictive entropy as uncertainty measure
        uncertainty = -np.sum(mean_pred * np.log(mean_pred + 1e-8), axis=1)
        
        return {
            'predictions': mean_pred,
            'uncertainty': uncertainty,
            'std': std_pred
        }
```

### **Performance Optimization Techniques**

#### **1. Knowledge Distillation**
```python
class KnowledgeDistillation:
    def __init__(self, teacher_model, student_model, temperature=3.0, alpha=0.7):
        self.teacher = teacher_model
        self.student = student_model
        self.temperature = temperature
        self.alpha = alpha
    
    def distillation_loss(self, y_true, y_pred_student, y_pred_teacher):
        """Combined distillation loss"""
        
        # Soften predictions with temperature
        soft_teacher = tf.nn.softmax(y_pred_teacher / self.temperature)
        soft_student = tf.nn.softmax(y_pred_student / self.temperature)
        
        # Distillation loss (KL divergence)
        distillation_loss = tf.keras.losses.KLDivergence()(soft_teacher, soft_student)
        
        # Standard loss
        standard_loss = tf.keras.losses.sparse_categorical_crossentropy(y_true, y_pred_student)
        
        # Combined loss
        total_loss = self.alpha * distillation_loss + (1 - self.alpha) * standard_loss
        
        return total_loss
    
    def train_student(self, train_data, val_data, epochs=50):
        """Train student model using teacher knowledge"""
        
        # Custom training loop for distillation
        optimizer = tf.keras.optimizers.Adam(0.001)
        
        for epoch in range(epochs):
            epoch_loss = 0
            num_batches = 0
            
            for batch_x, batch_y in train_data:
                with tf.GradientTape() as tape:
                    # Teacher predictions (fixed)
                    teacher_pred = self.teacher(batch_x, training=False)
                    
                    # Student predictions
                    student_pred = self.student(batch_x, training=True)
                    
                    # Calculate distillation loss
                    loss = self.distillation_loss(batch_y, student_pred, teacher_pred)
                
                # Update student model
                gradients = tape.gradient(loss, self.student.trainable_variables)
                optimizer.apply_gradients(zip(gradients, self.student.trainable_variables))
                
                epoch_loss += loss
                num_batches += 1
            
            # Validation
            val_accuracy = self._evaluate_student(val_data)
            print(f"Epoch {epoch+1}: Loss={epoch_loss/num_batches:.4f}, Val Acc={val_accuracy:.4f}")
```

#### **2. Neural Architecture Search (NAS)**
```python
class NeuralArchitectureSearch:
    def __init__(self, search_space, performance_estimator):
        self.search_space = search_space
        self.estimator = performance_estimator
        
    def search_architecture(self, budget=100):
        """Search for optimal architecture within constraints"""
        
        best_architecture = None
        best_score = 0
        
        for trial in range(budget):
            # Sample architecture from search space
            architecture = self._sample_architecture()
            
            # Build and evaluate model
            model = self._build_model_from_architecture(architecture)
            score = self._evaluate_architecture(model)
            
            # Update best if better
            if score > best_score:
                best_score = score
                best_architecture = architecture
            
            print(f"Trial {trial+1}: Score={score:.4f}, Best={best_score:.4f}")
        
        return best_architecture, best_score
    
    def _sample_architecture(self):
        """Sample architecture from search space"""
        return {
            'backbone': np.random.choice(['efficientnet_b0', 'mobilenet_v2', 'resnet50']),
            'input_size': np.random.choice([224, 256, 288]),
            'depth_multiplier': np.random.uniform(0.5, 1.5),
            'width_multiplier': np.random.uniform(0.5, 1.5)
        }
```

---

This comprehensive ML documentation provides a complete guide for understanding, implementing, and maintaining the machine learning components of GingerlyAI, from data collection through deployment and continuous improvement.
