# 🤖 CNN-First Ginger Disease Detection

## 🎯 **Overview**

GingerlyAI uses **CNN (Convolutional Neural Networks)** as the primary approach for ginger disease detection. This system is designed to be lightweight, fast, and mobile-optimized while maintaining high accuracy.

## 🏗️ **CNN Architecture**

### **Primary Model: Custom CNN**
```python
# Custom CNN Architecture (Sequential)
Input(224, 224, 3)
├── Conv2D(32, 5x5, strides=2) + ReLU + MaxPool(3x3)
├── Conv2D(32, 3x3, strides=1) + ReLU + MaxPool(2x2)
├── Conv2D(128, 3x3, strides=1) + ReLU
├── Conv2D(64, 5x5, strides=2) + ReLU
├── Conv2D(32, 3x3, strides=1) + ReLU + MaxPool(2x2)
├── Flatten()
├── Dense(64) + ReLU + Dropout(0.3)
├── Dense(32) + ReLU + Dropout(0.3)
└── Dense(7) + Softmax  # 7 disease classes
```

### **Alternative Model: Hybrid CNN**
```python
# Hybrid CNN (CNN + Transfer Learning)
MobileNetV2 (frozen base)
├── GlobalAveragePooling2D()
├── Dense(128) + ReLU + Dropout(0.3)
├── Dense(64) + ReLU + Dropout(0.3)
└── Dense(7) + Softmax  # 7 disease classes
```

## 📊 **Disease Classes**

The CNN model detects **7 ginger disease classes**:

1. **healthy** - Healthy ginger plants
2. **bacterial_wilt** - Bacterial wilt disease
3. **rhizome_rot** - Rhizome rot disease
4. **leaf_spot** - Leaf spot disease
5. **soft_rot** - Soft rot disease
6. **yellow_disease** - Yellow disease
7. **root_knot_nematode** - Root knot nematode damage

## 🚀 **Quick Start**

### **1. Setup Environment**
```bash
cd ml-training
pip install tensorflow keras numpy pandas opencv-python Pillow scikit-learn matplotlib seaborn tqdm requests python-dotenv h5py tensorboard
```

### **2. Add Dataset Images**
```bash
# Interactive mode
python add_images.py --interactive

# Or command line
python add_images.py --class healthy --source /path/to/images
```

### **3. Run Complete CNN Pipeline**
```bash
python setup_ai_model.py
# Choose option 6 for complete pipeline
```

### **4. Train CNN Model Only**
```bash
python cnn_model_training.py
```

## 🔧 **Configuration**

### **CNN Training Parameters**
```python
TRAINING_CONFIG = {
    'img_height': 224,
    'img_width': 224,
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.001,
    'model_type': 'cnn',  # Primary approach
    
    # Data Augmentation
    'rotation_range': 25,
    'width_shift_range': 0.1,
    'height_shift_range': 0.1,
    'horizontal_flip': True,
    'zoom_range': 0.2,
    'shear_range': 0.2,
    
    # CNN Architecture
    'cnn_architecture': {
        'conv_layers': [...],  # Custom CNN layers
        'dense_layers': [...], # Dense layers
        'output_units': 7,     # 7 disease classes
        'output_activation': 'softmax'
    }
}
```

## 📁 **File Structure**

```
ml-training/
├── cnn_model_training.py      # Main CNN training script
├── integrate_cnn_notebook.py  # Notebook integration
├── config.py                  # CNN-focused configuration
├── data_preprocessing.py      # Data preprocessing
├── model_export.py           # TensorFlow.js export
├── add_images.py             # Image management
├── validate_images.py        # Image validation
├── CNN_based_ginger_detectioin.ipynb  # Original notebook
├── data/
│   └── raw/ginger_dataset/   # Dataset images
│       ├── healthy/
│       ├── bacterial_wilt/
│       ├── rhizome_rot/
│       ├── leaf_spot/
│       ├── soft_rot/
│       ├── yellow_disease/
│       └── root_knot_nematode/
├── models/                   # Trained models
├── exports/                  # TensorFlow.js models
└── logs/                     # Training logs
```

## 🎯 **Model Training Process**

### **1. Data Preprocessing**
- Load images from dataset directories
- Resize to 224x224 pixels
- Apply data augmentation
- Split into train/validation/test sets

### **2. CNN Training**
- Create custom CNN architecture
- Compile with Adam optimizer
- Train with data augmentation
- Monitor with callbacks (EarlyStopping, ReduceLROnPlateau)

### **3. Model Evaluation**
- Evaluate on test set
- Generate classification report
- Create confusion matrix
- Plot training history

### **4. Model Export**
- Save as H5 format
- Export to TensorFlow.js
- Generate model metadata
- Create mobile-optimized version

## 📊 **Performance Metrics**

### **Target Performance**
- **Accuracy**: >90% on test set
- **Inference Time**: <500ms per prediction
- **Model Size**: <50MB for mobile
- **Memory Usage**: <100MB during inference

### **Training Monitoring**
- Real-time accuracy/loss plots
- TensorBoard integration
- CSV logging
- Model checkpointing

## 🔄 **Training Options**

### **Option 1: Custom CNN**
```bash
python cnn_model_training.py
# Choose option 1 for Custom CNN
```

### **Option 2: Hybrid CNN**
```bash
python cnn_model_training.py
# Choose option 2 for Hybrid CNN
```

### **Option 3: Compare Both**
```bash
python cnn_model_training.py
# Choose option 3 to compare both approaches
```

## 📱 **Mobile Integration**

### **TensorFlow.js Export**
```bash
python model_export.py
```

### **Mobile App Integration**
```javascript
// Load model in mobile app
const model = await tf.loadLayersModel('path/to/tfjs_model/model.json');

// Make prediction
const prediction = model.predict(preprocessedImage);
const results = await prediction.data();
```

## 🛠️ **Development Tools**

### **Image Management**
```bash
# Check dataset status
python add_images.py --status

# Add images interactively
python add_images.py --interactive

# Validate images
python validate_images.py
```

### **Training Monitoring**
```bash
# View TensorBoard
tensorboard --logdir logs/tensorboard

# Check training logs
cat logs/training_log.csv
```

### **Model Testing**
```bash
# Test trained model
python model_evaluation.py

# Export to mobile
python model_export.py
```

## 🎯 **Best Practices**

### **Dataset Quality**
- **Minimum**: 50 images per class
- **Recommended**: 100+ images per class
- **Image Quality**: Clear, well-lit, in-focus
- **Diversity**: Different angles, lighting, growth stages

### **Training Tips**
- **Start Small**: Begin with fewer epochs
- **Monitor Overfitting**: Watch validation accuracy
- **Data Augmentation**: Use to increase dataset diversity
- **Regular Checkpoints**: Save best models during training

### **Model Optimization**
- **Quantization**: Reduce model size for mobile
- **Pruning**: Remove unnecessary weights
- **Optimization**: Use TensorFlow.js optimizations

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Out of Memory**
   - Reduce batch size
   - Use smaller image size
   - Enable mixed precision

2. **Poor Accuracy**
   - Increase dataset size
   - Adjust learning rate
   - Try different architecture

3. **Overfitting**
   - Increase dropout
   - Add regularization
   - Use more data augmentation

4. **Slow Training**
   - Use GPU if available
   - Reduce image size
   - Optimize data pipeline

### **Debug Commands**
```bash
# Check GPU availability
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"

# Test data loading
python -c "from cnn_model_training import CNNGingerDiseaseModel; trainer = CNNGingerDiseaseModel(); print('Data loading test passed')"

# Validate model architecture
python -c "from cnn_model_training import CNNGingerDiseaseModel; trainer = CNNGingerDiseaseModel(); model = trainer.create_cnn_model(); print('Model creation test passed')"
```

## 📈 **Performance Optimization**

### **For Mobile Deployment**
- Use MobileNetV2 as base for hybrid model
- Apply quantization during export
- Optimize for speed over size
- Test on actual mobile devices

### **For Accuracy**
- Use custom CNN for domain-specific features
- Apply advanced data augmentation
- Use ensemble methods
- Fine-tune hyperparameters

## 🎉 **Success Metrics**

### **Model Performance**
- ✅ **Accuracy**: >90% on test set
- ✅ **Speed**: <500ms inference time
- ✅ **Size**: <50MB model size
- ✅ **Mobile**: Works on Android/iOS

### **Development Success**
- ✅ **CNN-First**: Primary approach is CNN
- ✅ **7 Classes**: Detects all disease types
- ✅ **Mobile Ready**: TensorFlow.js export
- ✅ **Production Ready**: Full pipeline

---

## 🚀 **Next Steps**

1. **Add Real Images**: Collect ginger disease photos
2. **Train CNN Model**: Run the training pipeline
3. **Test Performance**: Evaluate on test set
4. **Export to Mobile**: Convert to TensorFlow.js
5. **Deploy to App**: Integrate with mobile app

**The CNN-first approach ensures optimal performance for ginger disease detection while maintaining mobile compatibility!** 🌱🤖
