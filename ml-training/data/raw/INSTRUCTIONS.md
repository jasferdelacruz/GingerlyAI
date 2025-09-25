# 📸 Raw Dataset Instructions

## 📁 Directory Structure

Organize raw images by disease class in the following structure:

```
raw/
├── healthy/                    # Healthy ginger plants
├── bacterial_wilt/             # Bacterial wilt disease
├── rhizome_rot/               # Rhizome rot disease  
├── leaf_spot/                 # Leaf spot disease
├── soft_rot/                  # Soft rot disease
├── yellow_disease/            # Yellow disease (viral)
└── root_knot_nematode/        # Root knot nematode damage
```

## 📋 Image Requirements

### **File Specifications**
- **Format**: JPEG (.jpg) or PNG (.png)
- **Resolution**: Minimum 224x224, recommended 512x512+
- **Quality**: JPEG quality ≥ 75%, recommended 90%+
- **Color**: RGB color images (no grayscale)
- **Size**: Maximum 10MB per image

### **Naming Convention**
```
{disease_class}_{unique_id}_{date}_{additional_info}.jpg

Examples:
- healthy_001_20240115_seedling.jpg
- bacterial_wilt_045_20240116_severe.jpg
- leaf_spot_022_20240117_early_stage.jpg
```

**Note**: Images will be organized in subdirectories matching the exact class names from config.py:
- `healthy/`
- `bacterial_wilt/`
- `rhizome_rot/`
- `leaf_spot/`
- `soft_rot/`
- `yellow_disease/`
- `root_knot_nematode/`

### **Image Quality Standards**
- **Lighting**: Natural daylight preferred, avoid flash
- **Focus**: Sharp, well-focused images
- **Composition**: Disease symptoms clearly visible
- **Background**: Minimal distracting elements
- **Angle**: Multiple angles for comprehensive coverage

## 📊 Sample Requirements

### **Minimum Samples per Class**
- **Healthy**: 2,000 images
- **Bacterial Wilt**: 1,500 images
- **Rhizome Rot**: 1,200 images
- **Leaf Spot**: 1,500 images
- **Soft Rot**: 1,000 images
- **Yellow Disease**: 800 images
- **Root Knot Nematode**: 1,000 images

### **Diversity Requirements**
- **Growth Stages**: Seedling, vegetative, mature
- **Severity Levels**: Early, moderate, severe
- **Plant Parts**: Leaves, stems, rhizomes, whole plant
- **Environmental Conditions**: Different lighting, backgrounds
- **Geographic Diversity**: Multiple regions/farms

## 🔍 Quality Control

### **Before Adding Images**
1. **Visual Inspection**: Ensure image quality and correct labeling
2. **Metadata Check**: Verify filename follows convention
3. **Duplicate Detection**: Check for duplicate images
4. **Disease Verification**: Confirm disease classification with expert

### **Image Rejection Criteria**
- Blurry or out-of-focus images
- Poor lighting (too dark/bright)
- Wrong disease classification
- Non-ginger plant images
- Corrupted or damaged files

## 📝 Data Collection Protocol

### **Field Collection Guidelines**
1. **Equipment**: Use smartphone camera with good resolution
2. **Timing**: Collect during optimal lighting conditions
3. **Documentation**: Record collection metadata
4. **Storage**: Transfer images promptly to avoid loss
5. **Backup**: Maintain backup copies during collection

### **Metadata Recording**
For each image, record:
- **Collection Date**: When image was taken
- **Location**: GPS coordinates or farm location
- **Device**: Camera/smartphone model
- **Collector**: Person who took the image
- **Notes**: Additional observations

## 🚨 Important Guidelines

### **Legal and Ethical**
- **Consent**: Obtain permission from farm owners
- **Privacy**: Avoid capturing personal information
- **Attribution**: Credit data contributors appropriately
- **Usage Rights**: Ensure proper usage permissions

### **Data Security**
- **Backup**: Regular backups to multiple locations
- **Access Control**: Limit access to authorized personnel
- **Encryption**: Encrypt sensitive metadata
- **Version Control**: Track dataset versions

## 📋 Checklist for New Images

- [ ] Correct directory placement
- [ ] Proper filename convention
- [ ] Image quality meets standards
- [ ] Disease classification verified
- [ ] Metadata recorded
- [ ] Duplicates checked
- [ ] Backup created

## 📞 Contact

For questions about data collection or quality standards:
- ML Team Lead: ml@gingerlyai.com
- Data Quality: quality@gingerlyai.com
- Technical Issues: Create GitHub issue
