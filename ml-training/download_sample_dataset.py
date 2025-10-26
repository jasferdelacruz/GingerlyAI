#!/usr/bin/env python3

"""
Sample Dataset Downloader for GingerlyAI
Downloads sample images for testing the AI model
"""

import os
import requests
from pathlib import Path
import time

def download_sample_images():
    """Download sample images for testing"""
    print("📥 Downloading sample images for testing...")
    
    # Sample image URLs (using placeholder images for now)
    sample_images = {
        'healthy': [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
        ],
        'bacterial_wilt': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
        ],
        'rhizome_rot': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        ],
        'leaf_spot': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        ],
        'soft_rot': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        ],
        'yellow_disease': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        ],
        'root_knot_nematode': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        ]
    }
    
    data_dir = Path('data/raw/ginger_dataset')
    
    for class_name, urls in sample_images.items():
        class_dir = data_dir / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📁 Downloading images for {class_name}...")
        
        for i, url in enumerate(urls):
            try:
                response = requests.get(url, timeout=30)
                if response.status_code == 200:
                    img_path = class_dir / f'sample_{class_name}_{i+1:03d}.jpg'
                    with open(img_path, 'wb') as f:
                        f.write(response.content)
                    print(f"  ✅ Downloaded: {img_path.name}")
                else:
                    print(f"  ❌ Failed to download image {i+1}")
                
                time.sleep(1)  # Be nice to the server
                
            except Exception as e:
                print(f"  ❌ Error downloading image {i+1}: {e}")
    
    print("\n✅ Sample images downloaded!")
    print("⚠️  Note: These are placeholder images. Replace with real ginger disease images for actual training.")

def create_synthetic_dataset():
    """Create a synthetic dataset using image generation"""
    print("🎨 Creating synthetic dataset...")
    
    try:
        import numpy as np
        from PIL import Image, ImageDraw, ImageFont
        import random
        
        data_dir = Path('data/raw/ginger_dataset')
        classes = ['healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot', 'soft_rot', 'yellow_disease', 'root_knot_nematode']
        
        for class_name in classes:
            class_dir = data_dir / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            
            print(f"📁 Creating synthetic images for {class_name}...")
            
            # Create 20 synthetic images per class
            for i in range(20):
                # Create a base image with random colors
                img = Image.new('RGB', (224, 224), color=(
                    random.randint(50, 200),
                    random.randint(100, 255),
                    random.randint(50, 150)
                ))
                
                # Add some random shapes to simulate plant features
                draw = ImageDraw.Draw(img)
                
                # Draw some random shapes
                for _ in range(random.randint(3, 8)):
                    x1 = random.randint(0, 200)
                    y1 = random.randint(0, 200)
                    x2 = x1 + random.randint(20, 50)
                    y2 = y1 + random.randint(20, 50)
                    
                    color = (
                        random.randint(0, 255),
                        random.randint(0, 255),
                        random.randint(0, 255)
                    )
                    
                    draw.ellipse([x1, y1, x2, y2], fill=color)
                
                # Save the image
                img_path = class_dir / f'synthetic_{class_name}_{i+1:03d}.jpg'
                img.save(img_path)
            
            print(f"  ✅ Created 20 synthetic images for {class_name}")
        
        print("\n✅ Synthetic dataset created!")
        print("⚠️  Note: These are synthetic images for testing. Replace with real ginger disease images for actual training.")
        
    except ImportError as e:
        print(f"❌ Error creating synthetic dataset: {e}")
        print("Please install required packages: pip install pillow numpy")

def main():
    """Main function"""
    print("🎯 GingerlyAI Sample Dataset Creator")
    print("=" * 50)
    
    print("Choose an option:")
    print("1. Download sample images from internet")
    print("2. Create synthetic dataset")
    print("3. Both")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        download_sample_images()
    elif choice == '2':
        create_synthetic_dataset()
    elif choice == '3':
        download_sample_images()
        create_synthetic_dataset()
    else:
        print("❌ Invalid choice!")
        return
    
    print("\n🎉 Dataset setup complete!")
    print("Next steps:")
    print("1. Run: python setup_ai_model.py")
    print("2. Choose option 3 to run preprocessing")
    print("3. Choose option 4 to train the model")

if __name__ == "__main__":
    main()
