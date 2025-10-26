#!/usr/bin/env python3

"""
Prepare data for CNN training by creating the expected directory structure
"""

import os
import shutil
import numpy as np
from pathlib import Path
from PIL import Image
import json

from config import *

def prepare_cnn_data():
    """Prepare data in the format expected by CNN training"""
    
    print("🔄 Preparing data for CNN training...")
    
    # Source and destination directories
    source_dir = RAW_DATA_DIR / "ginger_dataset"
    dest_dir = PROCESSED_DATA_DIR / "ginger_processed"
    
    # Create destination structure
    train_dir = dest_dir / "train"
    val_dir = dest_dir / "validation"
    test_dir = dest_dir / "test"
    
    for split_dir in [train_dir, val_dir, test_dir]:
        split_dir.mkdir(parents=True, exist_ok=True)
        for class_name in DISEASE_CLASSES:
            (split_dir / class_name).mkdir(exist_ok=True)
    
    # Load the existing splits
    splits_dir = PROCESSED_DATA_DIR / "splits"
    
    if not splits_dir.exists():
        print("❌ Splits directory not found! Run data_preprocessing.py first.")
        return False
    
    # Load the data
    train_images = np.load(splits_dir / "train" / "images.npy")
    train_labels = np.load(splits_dir / "train" / "labels.npy")
    val_images = np.load(splits_dir / "validation" / "images.npy")
    val_labels = np.load(splits_dir / "validation" / "labels.npy")
    test_images = np.load(splits_dir / "test" / "images.npy")
    test_labels = np.load(splits_dir / "test" / "labels.npy")
    
    print(f"📊 Loaded data:")
    print(f"  Train: {len(train_images)} images")
    print(f"  Validation: {len(val_images)} images")
    print(f"  Test: {len(test_images)} images")
    
    # Save images to directories
    def save_images(images, labels, split_dir, split_name):
        print(f"💾 Saving {split_name} images...")
        
        for i, (img_path, label) in enumerate(zip(images, labels)):
            # Load image from path
            img = Image.open(img_path)
            
            # Get class name
            class_name = DISEASE_CLASSES[label]
            
            # Save image to new location
            new_img_path = split_dir / class_name / f"{class_name}_{i:03d}.jpg"
            img.save(new_img_path, "JPEG", quality=95)
        
        print(f"  ✅ Saved {len(images)} images to {split_dir}")
    
    # Save all splits
    save_images(train_images, train_labels, train_dir, "train")
    save_images(val_images, val_labels, val_dir, "validation")
    save_images(test_images, test_labels, test_dir, "test")
    
    print(f"\n🎉 Data preparation completed!")
    print(f"📁 Train directory: {train_dir}")
    print(f"📁 Validation directory: {val_dir}")
    print(f"📁 Test directory: {test_dir}")
    
    return True

def main():
    """Main function"""
    print("🌱 Preparing CNN Training Data")
    print("=" * 40)
    
    if prepare_cnn_data():
        print(f"\n🚀 Ready for CNN training!")
        print(f"Run: python cnn_model_training.py")
    else:
        print(f"\n❌ Data preparation failed!")

if __name__ == "__main__":
    main()
