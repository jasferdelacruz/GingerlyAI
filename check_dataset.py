#!/usr/bin/env python3

from pathlib import Path

def check_dataset():
    data_dir = Path('data/raw/ginger_dataset')
    print("🔍 Checking Ginger Disease Dataset...")
    print("=" * 50)
    
    if not data_dir.exists():
        print("❌ Dataset directory not found!")
        return
    
    total_images = 0
    class_counts = {}
    
    for disease_class in data_dir.iterdir():
        if disease_class.is_dir():
            # Count images in this class
            image_files = list(disease_class.glob("*.jpg")) + list(disease_class.glob("*.png")) + list(disease_class.glob("*.jpeg"))
            count = len(image_files)
            class_counts[disease_class.name] = count
            total_images += count
            print(f"📁 {disease_class.name}: {count} images")
    
    print("=" * 50)
    print(f"📊 Total images: {total_images}")
    print(f"📊 Classes: {len(class_counts)}")
    
    if total_images == 0:
        print("⚠️  No images found! Please add images to the dataset.")
    elif total_images < 100:
        print("⚠️  Very small dataset. Consider adding more images for better training.")
    elif total_images < 500:
        print("⚠️  Small dataset. More images would improve model performance.")
    else:
        print("✅ Dataset size looks good for training!")
    
    return class_counts, total_images

if __name__ == "__main__":
    check_dataset()
