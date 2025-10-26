#!/usr/bin/env python3

"""
Image Validation Script for GingerlyAI Dataset
Validates image quality, format, and organization
"""

import os
import sys
from pathlib import Path
from PIL import Image
import cv2
import numpy as np

def validate_images():
    """Validate all images in the dataset"""
    print("🔍 Validating Ginger Disease Dataset Images...")
    print("=" * 60)
    
    data_dir = Path('data/raw/ginger_dataset')
    classes = [
        'healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot',
        'soft_rot', 'yellow_disease', 'root_knot_nematode'
    ]
    
    total_images = 0
    valid_images = 0
    issues = []
    
    for class_name in classes:
        class_dir = data_dir / class_name
        print(f"\n📁 Checking {class_name}...")
        
        if not class_dir.exists():
            print(f"  ❌ Directory not found: {class_dir}")
            continue
        
        # Get all image files
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
            image_files.extend(class_dir.glob(ext))
        
        class_count = len(image_files)
        class_valid = 0
        
        print(f"  📊 Found {class_count} images")
        
        for img_path in image_files:
            total_images += 1
            
            try:
                # Check if file can be opened
                with Image.open(img_path) as img:
                    # Check image properties
                    width, height = img.size
                    mode = img.mode
                    format = img.format
                    
                    # Validate properties
                    is_valid = True
                    img_issues = []
                    
                    # Check resolution
                    if width < 224 or height < 224:
                        is_valid = False
                        img_issues.append(f"Resolution too small: {width}x{height}")
                    
                    # Check format
                    if format not in ['JPEG', 'PNG']:
                        is_valid = False
                        img_issues.append(f"Invalid format: {format}")
                    
                    # Check mode
                    if mode != 'RGB':
                        is_valid = False
                        img_issues.append(f"Invalid color mode: {mode}")
                    
                    # Check file size
                    file_size = img_path.stat().st_size
                    if file_size < 1024:  # Less than 1KB
                        is_valid = False
                        img_issues.append(f"File too small: {file_size} bytes")
                    elif file_size > 10 * 1024 * 1024:  # More than 10MB
                        is_valid = False
                        img_issues.append(f"File too large: {file_size / (1024*1024):.1f}MB")
                    
                    if is_valid:
                        class_valid += 1
                        valid_images += 1
                    else:
                        issues.append({
                            'file': str(img_path),
                            'class': class_name,
                            'issues': img_issues
                        })
                        
            except Exception as e:
                issues.append({
                    'file': str(img_path),
                    'class': class_name,
                    'issues': [f"Error opening file: {str(e)}"]
                })
        
        print(f"  ✅ Valid: {class_valid}/{class_count}")
        
        if class_count == 0:
            print(f"  ⚠️  No images found in {class_name}")
        elif class_valid == 0:
            print(f"  ❌ No valid images in {class_name}")
        elif class_valid < class_count:
            print(f"  ⚠️  Some images have issues in {class_name}")
        else:
            print(f"  ✅ All images valid in {class_name}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    print(f"Total images: {total_images}")
    print(f"Valid images: {valid_images}")
    print(f"Invalid images: {total_images - valid_images}")
    
    if total_images > 0:
        success_rate = (valid_images / total_images) * 100
        print(f"Success rate: {success_rate:.1f}%")
    
    # Issues report
    if issues:
        print(f"\n❌ ISSUES FOUND ({len(issues)} images):")
        print("-" * 40)
        for issue in issues[:10]:  # Show first 10 issues
            print(f"File: {issue['file']}")
            print(f"Class: {issue['class']}")
            for problem in issue['issues']:
                print(f"  - {problem}")
            print()
        
        if len(issues) > 10:
            print(f"... and {len(issues) - 10} more issues")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    print("-" * 40)
    
    if total_images == 0:
        print("1. Add images to the dataset directories")
        print("2. Follow the naming convention: {class}_{number:03d}.jpg")
        print("3. Ensure images are at least 224x224 pixels")
    elif valid_images == 0:
        print("1. Check image formats (should be JPEG or PNG)")
        print("2. Ensure images are at least 224x224 pixels")
        print("3. Check file sizes (not too small or too large)")
    elif valid_images < total_images:
        print("1. Fix the issues listed above")
        print("2. Re-run validation after fixes")
        print("3. Consider replacing problematic images")
    else:
        print("1. ✅ All images are valid!")
        print("2. Ready for preprocessing pipeline")
        print("3. Consider adding more images for better training")
    
    # Dataset size recommendations
    print("\n📈 DATASET SIZE RECOMMENDATIONS:")
    print("-" * 40)
    for class_name in classes:
        class_dir = data_dir / class_name
        if class_dir.exists():
            class_count = len(list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png')))
            if class_count < 50:
                print(f"{class_name}: {class_count} images (⚠️  Need more - target: 100+)")
            elif class_count < 100:
                print(f"{class_name}: {class_count} images (✅ Good - target: 100+)")
            else:
                print(f"{class_name}: {class_count} images (🎉 Excellent!)")
    
    return valid_images, total_images, issues

def create_sample_images():
    """Create sample images for testing if no real images available"""
    print("\n🎨 Creating sample images for testing...")
    
    try:
        import numpy as np
        from PIL import Image, ImageDraw, ImageFont
        import random
        
        data_dir = Path('data/raw/ginger_dataset')
        classes = [
            'healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot',
            'soft_rot', 'yellow_disease', 'root_knot_nematode'
        ]
        
        for class_name in classes:
            class_dir = data_dir / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            
            # Create 5 sample images per class
            for i in range(5):
                # Create a random colored image
                img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                img = Image.fromarray(img_array)
                
                # Add some text to identify the class
                draw = ImageDraw.Draw(img)
                try:
                    # Try to use a default font
                    font = ImageFont.load_default()
                except:
                    font = None
                
                text = f"{class_name}\n{i+1}"
                draw.text((10, 10), text, fill=(255, 255, 255), font=font)
                
                # Save the image
                img_path = class_dir / f'{class_name}_{i+1:03d}.jpg'
                img.save(img_path, 'JPEG', quality=85)
            
            print(f"  ✅ Created 5 sample images for {class_name}")
        
        print("\n⚠️  Note: These are sample images for testing only!")
        print("Replace with real ginger disease images for actual training.")
        
    except ImportError as e:
        print(f"❌ Error creating sample images: {e}")
        print("Please install required packages: pip install pillow numpy")

def main():
    """Main function"""
    print("🔍 GingerlyAI Image Validation Tool")
    print("=" * 60)
    
    # Check if dataset directory exists
    data_dir = Path('data/raw/ginger_dataset')
    if not data_dir.exists():
        print("❌ Dataset directory not found!")
        print("Please run: python setup_ai_model.py")
        return
    
    # Validate images
    valid_count, total_count, issues = validate_images()
    
    # If no images found, offer to create samples
    if total_count == 0:
        print("\n🤔 No images found in dataset.")
        response = input("Would you like to create sample images for testing? (y/n): ").lower()
        if response == 'y':
            create_sample_images()
            print("\n🔄 Re-validating after creating sample images...")
            validate_images()

if __name__ == "__main__":
    main()
