#!/usr/bin/env python3

"""
Create sample images for CNN testing
Simple script to generate synthetic ginger disease images
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import random
from pathlib import Path

# Disease classes
DISEASE_CLASSES = [
    'healthy',
    'bacterial_wilt',
    'rhizome_rot',
    'leaf_spot',
    'soft_rot',
    'yellow_disease',
    'root_knot_nematode'
]

def create_sample_image(class_name, image_size=(224, 224)):
    """Create a sample image for a given disease class"""
    
    # Create base image with green background (ginger plant)
    img = Image.new('RGB', image_size, color=(34, 139, 34))  # Forest green
    draw = ImageDraw.Draw(img)
    
    # Add some variation based on disease class
    if class_name == 'healthy':
        # Healthy green with some texture
        for _ in range(50):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(20, 60), random.randint(100, 150), random.randint(20, 60))
            draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
    
    elif class_name == 'bacterial_wilt':
        # Yellow/brown spots
        for _ in range(30):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(150, 200), random.randint(100, 150), random.randint(50, 100))
            draw.ellipse([x-3, y-3, x+3, y+3], fill=color)
    
    elif class_name == 'rhizome_rot':
        # Dark brown/black spots
        for _ in range(25):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(50, 100), random.randint(30, 80), random.randint(30, 80))
            draw.ellipse([x-4, y-4, x+4, y+4], fill=color)
    
    elif class_name == 'leaf_spot':
        # Small dark spots
        for _ in range(40):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(80, 120), random.randint(50, 100), random.randint(50, 100))
            draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
    
    elif class_name == 'soft_rot':
        # Watery, translucent spots
        for _ in range(35):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(200, 255), random.randint(200, 255), random.randint(150, 200))
            draw.ellipse([x-3, y-3, x+3, y+3], fill=color)
    
    elif class_name == 'yellow_disease':
        # Yellow discoloration
        for _ in range(60):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(200, 255), random.randint(200, 255), random.randint(100, 150))
            draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
    
    elif class_name == 'root_knot_nematode':
        # Swollen, knotted appearance
        for _ in range(20):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(100, 150), random.randint(80, 120), random.randint(60, 100))
            draw.ellipse([x-5, y-5, x+5, y+5], fill=color)
    
    # Add some noise for realism
    img_array = np.array(img)
    noise = np.random.randint(-20, 20, img_array.shape)
    img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(img_array)
    
    return img

def create_sample_dataset():
    """Create sample dataset with images for each class"""
    
    print("🌱 Creating Sample Ginger Disease Dataset")
    print("=" * 50)
    
    # Create dataset directory
    dataset_dir = Path("data/raw/ginger_dataset")
    dataset_dir.mkdir(parents=True, exist_ok=True)
    
    # Create class directories
    for class_name in DISEASE_CLASSES:
        class_dir = dataset_dir / class_name
        class_dir.mkdir(exist_ok=True)
        print(f"📁 Created directory: {class_dir}")
    
    # Generate sample images
    images_per_class = 20  # 20 images per class for testing
    
    for class_name in DISEASE_CLASSES:
        print(f"\n🎨 Generating {images_per_class} sample images for '{class_name}'...")
        
        class_dir = dataset_dir / class_name
        
        for i in range(images_per_class):
            # Create sample image
            img = create_sample_image(class_name)
            
            # Save image
            filename = f"{class_name}_{i+1:03d}.jpg"
            img_path = class_dir / filename
            img.save(img_path, "JPEG", quality=85)
            
            if (i + 1) % 5 == 0:
                print(f"  ✅ Generated {i+1}/{images_per_class} images")
    
    print(f"\n🎉 Sample dataset created successfully!")
    print(f"📁 Location: {dataset_dir}")
    print(f"📊 Total images: {len(DISEASE_CLASSES) * images_per_class}")
    print(f"📊 Images per class: {images_per_class}")
    
    # Show directory structure
    print(f"\n📂 Dataset Structure:")
    for class_name in DISEASE_CLASSES:
        class_dir = dataset_dir / class_name
        image_count = len(list(class_dir.glob("*.jpg")))
        print(f"  {class_name}/: {image_count} images")

def main():
    """Main function"""
    try:
        create_sample_dataset()
        
        print(f"\n🚀 Next Steps:")
        print(f"1. Run data preprocessing: python data_preprocessing.py")
        print(f"2. Train CNN model: python cnn_model_training.py")
        print(f"3. Validate images: python validate_images.py")
        
    except Exception as e:
        print(f"❌ Error creating sample dataset: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
