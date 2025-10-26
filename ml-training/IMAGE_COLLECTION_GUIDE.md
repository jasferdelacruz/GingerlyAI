# 📸 Ginger Disease Image Collection Guide

## 🎯 Overview

This guide will help you collect and organize real ginger disease images for training the AI model. We need high-quality images for each of the 7 disease classes.

## 📊 Required Dataset

### **Target Numbers**
- **Minimum**: 50 images per class (350 total)
- **Recommended**: 100+ images per class (700+ total)
- **Optimal**: 200+ images per class (1400+ total)

### **Disease Classes**
1. **healthy** - Healthy ginger plants
2. **bacterial_wilt** - Bacterial wilt disease
3. **rhizome_rot** - Rhizome rot disease
4. **leaf_spot** - Leaf spot disease
5. **soft_rot** - Soft rot disease
6. **yellow_disease** - Yellow disease
7. **root_knot_nematode** - Root knot nematode damage

## 📋 Image Collection Guidelines

### **Image Quality Requirements**
- **Format**: JPG, PNG, or JPEG
- **Resolution**: Minimum 224x224 pixels (will be resized automatically)
- **Quality**: Clear, well-lit, in-focus images
- **Lighting**: Natural daylight preferred, avoid shadows
- **Background**: Clean background, avoid clutter
- **Angle**: Multiple angles (close-up, full plant, affected areas)

### **What to Photograph**

#### **1. Healthy Ginger Plants** 🌱
- **Focus**: Overall plant health, green leaves, firm rhizomes
- **Angles**: Full plant, leaf close-ups, rhizome sections
- **Examples**: Young plants, mature plants, different growth stages

#### **2. Bacterial Wilt** 🦠
- **Symptoms**: Wilting leaves, yellowing, stunted growth, brown vascular tissue
- **Focus**: Wilted leaves, cut stems showing brown discoloration
- **Angles**: Affected leaves, stem cross-sections, overall plant

#### **3. Rhizome Rot** 🍄
- **Symptoms**: Soft, mushy rhizomes, discoloration, foul odor
- **Focus**: Affected rhizomes, rot patterns, fungal growth
- **Angles**: Cross-sections, surface damage, comparison with healthy rhizomes

#### **4. Leaf Spot** 🍃
- **Symptoms**: Circular or irregular spots on leaves, yellow halos
- **Focus**: Individual spots, leaf patterns, affected areas
- **Angles**: Close-up of spots, multiple spots on same leaf

#### **5. Soft Rot** 💧
- **Symptoms**: Water-soaked lesions, soft tissue, rapid decay
- **Focus**: Lesion patterns, affected tissue, decay progression
- **Angles**: Close-up of lesions, overall affected area

#### **6. Yellow Disease** 🟡
- **Symptoms**: Yellowing leaves, stunted growth, poor development
- **Focus**: Yellow leaf patterns, plant stunting, overall appearance
- **Angles**: Affected leaves, plant comparison, growth patterns

#### **7. Root Knot Nematode** 🐛
- **Symptoms**: Root galls, stunted growth, yellowing, poor yield
- **Focus**: Root galls, affected root systems, plant stunting
- **Angles**: Root close-ups, gall formations, plant comparison

## 📁 File Organization

### **Directory Structure**
```
ml-training/data/raw/ginger_dataset/
├── healthy/
│   ├── healthy_001.jpg
│   ├── healthy_002.jpg
│   └── ...
├── bacterial_wilt/
│   ├── bacterial_wilt_001.jpg
│   ├── bacterial_wilt_002.jpg
│   └── ...
├── rhizome_rot/
│   ├── rhizome_rot_001.jpg
│   └── ...
├── leaf_spot/
│   ├── leaf_spot_001.jpg
│   └── ...
├── soft_rot/
│   ├── soft_rot_001.jpg
│   └── ...
├── yellow_disease/
│   ├── yellow_disease_001.jpg
│   └── ...
└── root_knot_nematode/
    ├── root_knot_nematode_001.jpg
    └── ...
```

### **File Naming Convention**
- **Format**: `{disease_class}_{number:03d}.jpg`
- **Examples**: 
  - `healthy_001.jpg`
  - `bacterial_wilt_015.jpg`
  - `leaf_spot_042.jpg`

## 🔍 Image Sources

### **Primary Sources**
1. **Field Photography**: Take photos in actual ginger farms
2. **Research Institutions**: Agricultural universities, research centers
3. **Extension Services**: Agricultural extension offices
4. **Farmer Networks**: Local farmer groups and cooperatives

### **Secondary Sources**
1. **Online Databases**: Plant disease databases, research papers
2. **Agricultural Websites**: Government agricultural sites
3. **Research Publications**: Scientific papers with disease photos
4. **Educational Resources**: Agricultural education materials

### **Important Notes**
- **Copyright**: Ensure you have permission to use images
- **Attribution**: Keep track of image sources for documentation
- **Quality**: Prioritize high-quality, clear images
- **Diversity**: Include images from different regions, seasons, conditions

## 🛠️ Collection Tools

### **Camera Settings**
- **Resolution**: 4MP or higher (224x224 minimum)
- **Format**: JPEG (smaller file size)
- **Focus**: Manual focus for close-ups
- **Lighting**: Use natural light when possible
- **Stability**: Use tripod for close-up shots

### **Mobile Apps**
- **PlantNet**: For plant identification
- **iNaturalist**: For nature observations
- **Google Lens**: For plant identification
- **Camera Apps**: Use built-in camera with good settings

## 📝 Collection Checklist

### **Before Starting**
- [ ] Camera/phone charged and ready
- [ ] Memory card with sufficient space
- [ ] Field guide or reference materials
- [ ] Notebook for recording details
- [ ] Permission to photograph (if needed)

### **During Collection**
- [ ] Take multiple angles of each subject
- [ ] Include scale reference (coin, ruler)
- [ ] Record location and date
- [ ] Note weather conditions
- [ ] Take both close-up and wide shots

### **After Collection**
- [ ] Review images for quality
- [ ] Delete blurry or poor quality images
- [ ] Rename files according to convention
- [ ] Organize into correct directories
- [ ] Backup images to secure location

## 🚀 Quick Start Commands

### **1. Check Current Dataset**
```bash
cd ml-training
python check_dataset.py
```

### **2. Create Sample Images (for testing)**
```bash
python download_sample_dataset.py
```

### **3. Validate Images After Adding**
```bash
python validate_images.py
```

### **4. Run Preprocessing**
```bash
python data_preprocessing.py
```

## 📊 Progress Tracking

### **Collection Progress**
- **Healthy**: 0/100 images (0%)
- **Bacterial Wilt**: 0/100 images (0%)
- **Rhizome Rot**: 0/100 images (0%)
- **Leaf Spot**: 0/100 images (0%)
- **Soft Rot**: 0/100 images (0%)
- **Yellow Disease**: 0/100 images (0%)
- **Root Knot Nematode**: 0/100 images (0%)

**Total Progress**: 0/700 images (0%)

## 🆘 Troubleshooting

### **Common Issues**
1. **Blurry Images**: Use manual focus, ensure stability
2. **Poor Lighting**: Use natural light, avoid shadows
3. **Wrong Classification**: Consult field guides, get expert opinion
4. **File Size Issues**: Compress images if too large
5. **Naming Errors**: Use consistent naming convention

### **Quality Control**
- **Review**: Check each image before adding to dataset
- **Expert Validation**: Have agricultural expert verify classifications
- **Duplicate Removal**: Remove duplicate or similar images
- **Format Check**: Ensure all images are in correct format

## 📞 Support

### **Getting Help**
- **Technical Issues**: Check troubleshooting section
- **Classification Questions**: Consult agricultural experts
- **Quality Concerns**: Review image guidelines
- **File Organization**: Follow naming conventions

### **Resources**
- **Field Guides**: Local agricultural extension offices
- **Online Resources**: Plant disease databases
- **Expert Networks**: Agricultural universities, research centers
- **Community**: Local farmer groups, agricultural forums

---

## 🎯 Next Steps

1. **Start Collection**: Begin with healthy plants (easier to find)
2. **Build Gradually**: Add 10-20 images per class initially
3. **Validate Quality**: Review and improve image quality
4. **Run Preprocessing**: Process images through the pipeline
5. **Train Model**: Start with small dataset, then expand

**Remember**: Quality over quantity! It's better to have 50 high-quality images per class than 200 poor-quality ones.

---

*Happy collecting! 🌱📸*
