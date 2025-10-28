# Ginger Disease Detection - ML Training Pipeline

This directory contains the complete machine learning pipeline for training, evaluating, and exporting ginger disease detection models for use in the GingerlyAI mobile application.

## 🎯 Overview

The ML pipeline trains a deep learning model to classify ginger plant diseases from images. The trained model is then exported to TensorFlow.js format for offline inference in the mobile app.

## ✅ **CURRENT STATUS: MODEL TRAINED SUCCESSFULLY**

**Last Training**: October 28, 2025  
**Model Type**: Hybrid CNN with MobileNetV2 (Transfer Learning)  
**Test Accuracy**: **92.86%** 🎯  
**Validation Accuracy**: **100.00%**  
**Status**: ✅ **READY FOR DEPLOYMENT**

📊 **See [TRAINING_RESULTS.md](TRAINING_RESULTS.md) for detailed training results**

## 🧬 Disease Classes

The model can detect the following ginger diseases:

1. **Healthy** - No disease detected
2. **Bacterial Wilt** - Caused by Ralstonia solanacearum
3. **Rhizome Rot** - Fungal infection affecting rhizomes
4. **Leaf Spot** - Fungal leaf disease with characteristic spots
5. **Soft Rot** - Bacterial infection causing tissue decay
6. **Yellow Disease** - Viral infection causing yellowing
7. **Root Knot Nematode** - Parasitic nematode infection

## 📁 Directory Structure

```
ml-training/
├── config.py                 # Configuration settings
├── data_preprocessing.py      # Data preparation pipeline
├── model_training.py          # Model training pipeline
├── model_evaluation.py        # Model evaluation and testing
├── model_export.py           # Export to TensorFlow.js
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── data/                     # Dataset directory
│   ├── raw/                  # Raw dataset
│   └── processed/            # Processed dataset
├── models/                   # Trained models
├── logs/                     # Training logs and plots
└── exports/                  # Exported TensorFlow.js models
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Prepare Dataset

Organize your dataset in the following structure:

```
data/raw/ginger_dataset/
├── healthy/
├── bacterial_wilt/
├── rhizome_rot/
├── leaf_spot/
├── soft_rot/
├── yellow_disease/
└── root_knot_nematode/
```

Each folder should contain images of ginger plants with the corresponding condition.

### 3. Run the Pipeline

```bash
# Step 1: Preprocess data
python data_preprocessing.py

# Step 2: Train model
python model_training.py

# Step 3: Evaluate model
python model_evaluation.py

# Step 4: Export to TensorFlow.js
python model_export.py
```

## 🔧 Configuration

Edit `config.py` to customize:

- **Image dimensions**: Model input size (default: 224x224)
- **Training parameters**: Epochs, batch size, learning rate
- **Data augmentation**: Rotation, zoom, brightness adjustments
- **Model architecture**: Base model selection (EfficientNet, MobileNet, ResNet)
- **Export settings**: Quantization, optimization preferences

## 📊 Model Architecture

### Base Models Available:
- **EfficientNetB0** (default) - Best accuracy/size trade-off
- **MobileNetV2** - Optimized for mobile deployment
- **ResNet50** - High accuracy, larger size

### Custom Classification Head:
```
Input (224x224x3)
↓
Data Augmentation Layer
↓
Pre-trained Base Model (frozen initially)
↓
Global Average Pooling
↓
BatchNormalization + Dropout (0.5)
↓
Dense(512) + ReLU + L2 Regularization
↓
BatchNormalization + Dropout (0.5)
↓
Dense(256) + ReLU + L2 Regularization
↓
Dropout (0.3)
↓
Dense(7) + Softmax (Output)
```

## 🎓 Training Process

### Phase 1: Transfer Learning
1. Load pre-trained ImageNet weights
2. Freeze base model layers
3. Train classification head only
4. Early stopping based on validation accuracy

### Phase 2: Fine-Tuning
1. Unfreeze top layers of base model
2. Reduce learning rate (10x lower)
3. Fine-tune entire network
4. Save best model based on validation accuracy

### Data Augmentation:
- Random rotation (±30°)
- Width/height shifts (±20%)
- Horizontal flipping
- Zoom (±20%)
- Brightness adjustments (80-120%)
- Gaussian noise and blur

## 📈 Evaluation Metrics

The evaluation pipeline provides:

- **Classification Report**: Precision, Recall, F1-Score per class
- **Confusion Matrix**: Detailed classification accuracy
- **Confidence Analysis**: Distribution of prediction confidence
- **Misclassification Analysis**: Common error patterns
- **Inference Speed**: Benchmarking for mobile deployment

## 📱 Mobile Deployment

### TensorFlow.js Export Features:
- **Quantization**: 16-bit weights for smaller model size
- **Graph Optimization**: Optimized for inference speed
- **Metadata**: Complete model information and usage instructions
- **Sample Code**: JavaScript implementation example

### Mobile Optimization:
- Model size typically 5-15 MB (quantized)
- Inference time: 500-1000ms on modern mobile devices
- Offline capability with local storage
- WebGL/CPU backend support

## 🔍 Quality Assurance

### Automated Validation:
- Dataset integrity checks
- Model architecture validation
- Export format verification
- Performance benchmarking

### Performance Thresholds:
- **Excellent**: >95% accuracy
- **Good**: 90-95% accuracy
- **Moderate**: 80-90% accuracy
- **Poor**: <80% accuracy (needs improvement)

## 📊 Example Usage

### Training a Model:
```python
from model_training import GingerDiseaseModel
from config import *

# Initialize and build model
trainer = GingerDiseaseModel()
model = trainer.build_model('EfficientNetB0')

# Train with your data
history = trainer.train_model(train_gen, val_gen)
trainer.fine_tune_model(train_gen, val_gen)
```

### Exporting to TensorFlow.js:
```python
from model_export import ModelExporter

exporter = ModelExporter()
exporter.load_trained_model()
exporter.export_to_tensorflowjs(quantization=True)
```

## 🐛 Troubleshooting

### Common Issues:

1. **GPU Memory Error**
   - Reduce batch size in `config.py`
   - Use mixed precision training

2. **Low Accuracy**
   - Increase dataset size
   - Adjust data augmentation parameters
   - Try different base models

3. **Overfitting**
   - Increase dropout rates
   - Add more data augmentation
   - Reduce model complexity

4. **Export Errors**
   - Ensure TensorFlow.js compatibility
   - Check model architecture for unsupported layers

## 📞 Support

For issues related to:
- **Dataset preparation**: Check image formats and folder structure
- **Training problems**: Review logs in `logs/` directory
- **Export issues**: Validate model architecture and dependencies
- **Mobile integration**: Refer to the main app documentation

## 🔄 Model Versioning

### Naming Convention:
- `ginger_disease_v1.0.0.h5` - Keras model
- `tfjs_model_v1.0.0/` - TensorFlow.js export
- `metadata_v1.0.0.json` - Model metadata

### Version Control:
- Track model performance metrics
- Maintain backward compatibility
- Document architectural changes
- Monitor production performance

---

**Happy Training! 🌱🤖**
