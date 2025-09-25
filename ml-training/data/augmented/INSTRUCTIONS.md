# 🔄 Augmented Dataset Instructions

## 📁 Directory Purpose

This directory contains artificially generated images created through data augmentation techniques to increase dataset diversity and improve model robustness.

```
augmented/
├── healthy/                   # Augmented healthy plant images
├── bacterial_wilt/           # Augmented bacterial wilt images
├── rhizome_rot/             # Augmented rhizome rot images
├── leaf_spot/               # Augmented leaf spot images
├── soft_rot/                # Augmented soft rot images
├── yellow_disease/          # Augmented yellow disease images
├── root_knot_nematode/      # Augmented nematode damage images
└── generation_log.txt       # Augmentation process log
```

## 🎭 Augmentation Techniques Applied

### **Geometric Transformations**
- **Rotation**: ±30 degrees random rotation
- **Horizontal flip**: 50% probability
- **Zoom**: ±20% random zoom
- **Shift**: Width/height shift up to 20%
- **Shear**: ±10 degree shear transformation

### **Color Transformations**
- **Brightness**: ±20% brightness adjustment
- **Contrast**: ±20% contrast adjustment
- **Hue/Saturation**: ±10% hue and ±15% saturation shifts
- **Color jitter**: Random color channel adjustments

### **Quality Degradation**
- **Gaussian noise**: Simulated camera noise
- **Blur**: Motion and gaussian blur simulation
- **Compression**: JPEG compression artifacts
- **Lighting**: Simulated different lighting conditions

### **Environmental Simulation**
- **Weather effects**: Simulated rain, fog effects
- **Shadow overlay**: Random shadow patterns
- **Background variation**: Different background contexts

## ⚙️ Generation Process

### **Automatic Generation**
Run the augmentation script:
```bash
python generate_augmented_data.py --target-count 5000 --per-class-min 500
```

### **Configuration Parameters**
```python
AUGMENTATION_CONFIG = {
    'target_multiplier': 3,        # 3x original dataset size
    'min_per_class': 500,          # Minimum augmented samples per class
    'max_per_class': 2000,         # Maximum augmented samples per class
    'augmentation_strength': 0.7,   # Augmentation intensity (0.0-1.0)
    'preserve_ratio': 0.3          # Ratio of original images to preserve
}
```

### **Quality Control**
- **Visual inspection**: Random sample verification
- **Diversity check**: Ensure augmentation variety
- **Label preservation**: Maintain correct class labels
- **Artifact detection**: Remove heavily distorted images

## 📊 Augmentation Strategy

### **Class-Specific Augmentation**

#### **Healthy Plants**
- Focus on environmental variations
- Lighting condition changes
- Growth stage simulation
- Seasonal appearance variations

#### **Disease Classes**
- **Bacterial Wilt**: Progression simulation, severity variations
- **Rhizome Rot**: Different rot stages, exposure angles
- **Leaf Spot**: Spot density and distribution variations
- **Soft Rot**: Decay progression, texture emphasis
- **Yellow Disease**: Streak pattern variations, intensity levels
- **Root Knot Nematode**: Gall size and distribution variations

### **Balancing Strategy**
```python
# Target distribution after augmentation
TARGET_DISTRIBUTION = {
    'healthy': 4000,                # Well-represented, moderate augmentation
    'bacterial_wilt': 3500,         # Common disease, good augmentation
    'rhizome_rot': 3000,            # Increase representation
    'leaf_spot': 3500,              # Common, good representation
    'soft_rot': 2500,               # Moderate augmentation
    'yellow_disease': 2000,         # Rare disease, careful augmentation
    'root_knot_nematode': 2500      # Increase representation
}

# Must match exact class names from config.py:
# ['healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot', 
#  'soft_rot', 'yellow_disease', 'root_knot_nematode']
```

## 📋 File Naming Convention

```
{original_filename}_aug_{technique}_{index}_{timestamp}.jpg

Examples:
- healthy_001_20240115_aug_rotate_001_20240116.jpg
- bacterial_wilt_045_aug_brightness_002_20240116.jpg
- leaf_spot_022_aug_flip_hue_003_20240116.jpg
```

### **Technique Codes**
- `rotate`: Rotation transformation
- `flip`: Horizontal/vertical flip
- `bright`: Brightness adjustment
- `contrast`: Contrast adjustment
- `hue`: Hue/saturation adjustment
- `noise`: Noise addition
- `blur`: Blur application
- `combo`: Multiple techniques combined

## 🔍 Quality Assurance

### **Automated Checks**
```bash
python validate_augmented_data.py
```

Validates:
- [ ] Consistent image dimensions (224x224)
- [ ] Proper file format (JPEG)
- [ ] Valid class labels
- [ ] No corrupted images
- [ ] Reasonable file sizes

### **Manual Review**
Regular review of random samples:
- [ ] Augmentations look realistic
- [ ] Disease symptoms still visible
- [ ] No over-augmentation artifacts
- [ ] Proper diversity in techniques

### **Quality Metrics**
Track quality metrics:
- **Augmentation diversity**: Variety of techniques used
- **Visual quality**: Manual quality assessment scores
- **Training benefit**: Impact on model performance
- **Artifact rate**: Percentage of problematic augmentations

## 📊 Usage in Training

### **Integration with Training Pipeline**
```python
# Include augmented data in training
train_data_dir = [
    'data/processed/train',    # Original processed data
    'data/augmented'           # Augmented data
]

# Configure data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    # Note: Additional augmentation during training
    rotation_range=10,          # Light additional augmentation
    width_shift_range=0.1,
    height_shift_range=0.1
)
```

### **Augmentation Schedule**
```python
# Progressive augmentation during training
TRAINING_SCHEDULE = {
    'epochs_1_20': 'original_data_only',
    'epochs_21_50': 'original_plus_light_augmentation', 
    'epochs_51_80': 'full_augmented_dataset',
    'epochs_81_100': 'heavy_augmentation_online'
}
```

## 🚨 Best Practices

### **Dos**
- ✅ Maintain disease symptom visibility
- ✅ Use moderate augmentation strength
- ✅ Regularly validate augmented images
- ✅ Track augmentation impact on performance
- ✅ Keep original data separate

### **Don'ts**
- ❌ Over-augment rare classes
- ❌ Apply conflicting transformations
- ❌ Ignore visual quality
- ❌ Use only augmented data for validation
- ❌ Apply augmentation blindly

### **Monitoring**
- Track model performance with/without augmented data
- Monitor overfitting on augmented samples
- Validate on purely original test data
- Regular augmentation quality audits

## 📝 Regeneration

### **When to Regenerate**
- New raw data added to dataset
- Augmentation strategy changes
- Quality issues detected
- Model performance improvements needed

### **Regeneration Process**
```bash
# Clean existing augmented data
rm -rf data/augmented/*

# Regenerate with new parameters
python generate_augmented_data.py --config updated_config.json

# Validate new augmented dataset
python validate_augmented_data.py
```

## 📞 Support

For augmentation questions:
- ML Team: ml@gingerlyai.com
- Data Processing: data@gingerlyai.com
- Quality Issues: Create GitHub issue with "augmentation" label
