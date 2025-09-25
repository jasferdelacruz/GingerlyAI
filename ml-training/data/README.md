# 📊 GingerlyAI Dataset Directory

This directory contains all data used for training, validation, and testing the ginger disease detection model.

## 📁 Directory Structure

```
data/
├── raw/                    # Original, unprocessed images
├── processed/              # Preprocessed and organized images
├── metadata/               # Dataset metadata and annotations
├── augmented/              # Generated augmented images
└── external/               # External datasets and references
```

**Note**: This structure matches the paths defined in `config.py`:
- `RAW_DATA_DIR = DATA_DIR / "raw"`
- `PROCESSED_DATA_DIR = DATA_DIR / "processed"`
- Disease classes: `['healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot', 'soft_rot', 'yellow_disease', 'root_knot_nematode']`

## 🚨 Important Notes

- **Do not commit image files to Git** - Use Git LFS or external storage
- **Follow naming conventions** as specified in each subdirectory
- **Maintain data quality standards** - See quality guidelines in each folder
- **Update metadata** when adding new images
- **Backup regularly** - Raw data is irreplaceable

## 📋 Quick Start

1. Place raw images in `raw/` following the disease class structure
2. Run preprocessing pipeline: `python data_preprocessing.py`
3. Verify processed data in `processed/` directory
4. Check metadata files for dataset statistics

## 📞 Support

For dataset questions, contact the ML team or create an issue in the repository.
