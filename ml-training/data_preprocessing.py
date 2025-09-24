"""
Data preprocessing pipeline for Ginger Disease Detection
"""
import os
import shutil
import numpy as np
import pandas as pd
from pathlib import Path
from PIL import Image
import cv2
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
import albumentations as A
from tqdm import tqdm
import json

from config import *

class GingerDataPreprocessor:
    def __init__(self):
        self.img_height = TRAINING_CONFIG['img_height']
        self.img_width = TRAINING_CONFIG['img_width']
        self.disease_classes = DISEASE_CLASSES
        
    def organize_dataset(self, source_dir):
        """
        Organize raw dataset into proper structure
        Expected input structure: source_dir/disease_name/image_files
        """
        print("📁 Organizing dataset structure...")
        
        organized_dir = PROCESSED_DATASET_PATH
        organized_dir.mkdir(exist_ok=True, parents=True)
        
        dataset_info = {
            'classes': {},
            'total_images': 0,
            'class_distribution': {}
        }
        
        for disease_class in self.disease_classes:
            class_dir = organized_dir / disease_class
            class_dir.mkdir(exist_ok=True)
            
            source_class_dir = Path(source_dir) / disease_class
            if not source_class_dir.exists():
                print(f"⚠️  Warning: {disease_class} directory not found in source")
                continue
                
            image_count = 0
            valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
            
            for img_file in source_class_dir.iterdir():
                if img_file.suffix.lower() in valid_extensions:
                    try:
                        # Validate and copy image
                        img = Image.open(img_file)
                        img.verify()  # Verify image integrity
                        
                        # Copy to organized directory
                        dest_path = class_dir / f"{disease_class}_{image_count:05d}{img_file.suffix}"
                        shutil.copy2(img_file, dest_path)
                        image_count += 1
                        
                    except Exception as e:
                        print(f"❌ Error processing {img_file}: {e}")
                        continue
            
            dataset_info['classes'][disease_class] = image_count
            dataset_info['total_images'] += image_count
            dataset_info['class_distribution'][disease_class] = image_count
            
            print(f"✅ {disease_class}: {image_count} images")
        
        # Save dataset info
        with open(organized_dir / 'dataset_info.json', 'w') as f:
            json.dump(dataset_info, f, indent=2)
            
        print(f"📊 Total images: {dataset_info['total_images']}")
        return dataset_info
    
    def create_augmentation_pipeline(self):
        """Create data augmentation pipeline"""
        return A.Compose([
            # Geometric transformations
            A.Rotate(limit=TRAINING_CONFIG['rotation_range'], p=0.7),
            A.HorizontalFlip(p=0.5),
            A.ShiftScaleRotate(
                shift_limit=0.1,
                scale_limit=0.1,
                rotate_limit=15,
                p=0.7
            ),
            
            # Color transformations
            A.RandomBrightnessContrast(
                brightness_limit=0.2,
                contrast_limit=0.2,
                p=0.6
            ),
            A.HueSaturationValue(
                hue_shift_limit=10,
                sat_shift_limit=15,
                val_shift_limit=10,
                p=0.6
            ),
            
            # Noise and blur
            A.OneOf([
                A.GaussNoise(var_limit=(10.0, 50.0)),
                A.GaussianBlur(blur_limit=3),
                A.MotionBlur(blur_limit=3),
            ], p=0.4),
            
            # Weather effects
            A.OneOf([
                A.RandomShadow(p=0.3),
                A.RandomFog(fog_coef_lower=0.1, fog_coef_upper=0.3, p=0.3),
            ], p=0.3),
            
            # Final resize and normalize
            A.Resize(self.img_height, self.img_width),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def preprocess_image(self, image_path, augment=False):
        """Preprocess a single image"""
        try:
            # Load image
            image = cv2.imread(str(image_path))
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            if augment:
                # Apply augmentation
                augmentation = self.create_augmentation_pipeline()
                augmented = augmentation(image=image)
                image = augmented['image']
            else:
                # Simple resize and normalize
                image = cv2.resize(image, (self.img_width, self.img_height))
                image = image.astype(np.float32) / 255.0
                
                # ImageNet normalization
                mean = np.array([0.485, 0.456, 0.406])
                std = np.array([0.229, 0.224, 0.225])
                image = (image - mean) / std
            
            return image
            
        except Exception as e:
            print(f"❌ Error preprocessing {image_path}: {e}")
            return None
    
    def create_data_splits(self, dataset_dir, test_size=0.2, val_size=0.2):
        """Create train/validation/test splits"""
        print("🔄 Creating data splits...")
        
        all_images = []
        all_labels = []
        
        # Collect all image paths and labels
        for class_idx, class_name in enumerate(self.disease_classes):
            class_dir = Path(dataset_dir) / class_name
            if not class_dir.exists():
                continue
                
            for img_path in class_dir.glob('*'):
                if img_path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp'}:
                    all_images.append(str(img_path))
                    all_labels.append(class_idx)
        
        # Convert to arrays
        all_images = np.array(all_images)
        all_labels = np.array(all_labels)
        
        # First split: train+val vs test
        X_temp, X_test, y_temp, y_test = train_test_split(
            all_images, all_labels, 
            test_size=test_size, 
            stratify=all_labels, 
            random_state=42
        )
        
        # Second split: train vs val
        val_size_adjusted = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, 
            test_size=val_size_adjusted, 
            stratify=y_temp, 
            random_state=42
        )
        
        splits = {
            'train': {'images': X_train, 'labels': y_train},
            'validation': {'images': X_val, 'labels': y_val},
            'test': {'images': X_test, 'labels': y_test}
        }
        
        # Print split information
        for split_name, data in splits.items():
            print(f"📊 {split_name.capitalize()}: {len(data['images'])} images")
            unique, counts = np.unique(data['labels'], return_counts=True)
            for class_idx, count in zip(unique, counts):
                print(f"   {self.disease_classes[class_idx]}: {count}")
        
        return splits
    
    def compute_class_weights(self, y_train):
        """Compute class weights for handling imbalanced data"""
        class_weights = compute_class_weight(
            'balanced',
            classes=np.unique(y_train),
            y=y_train
        )
        
        class_weight_dict = dict(enumerate(class_weights))
        print("⚖️  Class weights:")
        for idx, weight in class_weight_dict.items():
            print(f"   {self.disease_classes[idx]}: {weight:.3f}")
            
        return class_weight_dict
    
    def save_preprocessed_data(self, splits, output_dir):
        """Save preprocessed data splits"""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True, parents=True)
        
        for split_name, data in splits.items():
            split_dir = output_dir / split_name
            split_dir.mkdir(exist_ok=True)
            
            # Save as numpy arrays for fast loading
            np.save(split_dir / 'images.npy', data['images'])
            np.save(split_dir / 'labels.npy', data['labels'])
            
            # Save metadata
            metadata = {
                'num_samples': len(data['images']),
                'num_classes': len(self.disease_classes),
                'class_names': self.disease_classes,
                'image_shape': [self.img_height, self.img_width, 3]
            }
            
            with open(split_dir / 'metadata.json', 'w') as f:
                json.dump(metadata, f, indent=2)
        
        print(f"💾 Preprocessed data saved to {output_dir}")

def main():
    """Main preprocessing pipeline"""
    print("🚀 Starting Ginger Disease Detection Data Preprocessing Pipeline")
    
    preprocessor = GingerDataPreprocessor()
    
    # Step 1: Organize raw dataset
    if DATASET_PATH.exists():
        dataset_info = preprocessor.organize_dataset(DATASET_PATH)
    else:
        print(f"❌ Dataset not found at {DATASET_PATH}")
        print("📝 Please place your dataset in the following structure:")
        print("   data/raw/ginger_dataset/")
        print("   ├── healthy/")
        print("   ├── bacterial_wilt/")
        print("   ├── rhizome_rot/")
        print("   ├── leaf_spot/")
        print("   ├── soft_rot/")
        print("   ├── yellow_disease/")
        print("   └── root_knot_nematode/")
        return
    
    # Step 2: Create data splits
    splits = preprocessor.create_data_splits(PROCESSED_DATASET_PATH)
    
    # Step 3: Compute class weights
    class_weights = preprocessor.compute_class_weights(splits['train']['labels'])
    
    # Step 4: Save preprocessed data
    preprocessor.save_preprocessed_data(splits, PROCESSED_DATA_DIR / 'splits')
    
    # Save class weights
    with open(PROCESSED_DATA_DIR / 'class_weights.json', 'w') as f:
        json.dump(class_weights, f, indent=2)
    
    print("✅ Data preprocessing completed successfully!")

if __name__ == "__main__":
    main()
