# 📁 Path Configuration Notice

## 🚨 Important Path Information

Based on `config.py`, the preprocessing pipeline expects raw images to be located at:

```
ml-training/data/raw/ginger_dataset/
├── healthy/
├── bacterial_wilt/
├── rhizome_rot/
├── leaf_spot/
├── soft_rot/
├── yellow_disease/
└── root_knot_nematode/
```

## 🔧 Path Configuration from config.py

```python
DATASET_PATH = RAW_DATA_DIR / "ginger_dataset"
PROCESSED_DATASET_PATH = PROCESSED_DATA_DIR / "ginger_processed"
```

Where:
- `RAW_DATA_DIR = BASE_DIR / "data" / "raw"`
- `PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"`

## 📋 Setup Instructions

### Option 1: Create ginger_dataset subdirectory
```bash
mkdir -p ml-training/data/raw/ginger_dataset
# Then create disease class subdirectories inside ginger_dataset/
```

### Option 2: Update config.py paths
Change in `config.py`:
```python
# From:
DATASET_PATH = RAW_DATA_DIR / "ginger_dataset"
# To:
DATASET_PATH = RAW_DATA_DIR  # Use raw directory directly
```

## 🔄 Processed Data Path

Similarly, processed data will be output to:
```
ml-training/data/processed/ginger_processed/
├── train/
├── validation/
└── test/
```

## ✅ Recommendation

For consistency with existing configuration, create the `ginger_dataset` subdirectory and place disease class folders inside it.
