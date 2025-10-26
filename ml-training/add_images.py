#!/usr/bin/env python3

"""
Image Upload Helper for GingerlyAI Dataset
Helps organize and add images to the correct disease class directories
"""

import os
import shutil
from pathlib import Path
import argparse

def add_images_to_class(class_name, source_dir, target_count=None):
    """Add images to a specific disease class directory"""
    print(f"📁 Adding images to {class_name}...")
    
    # Validate class name
    valid_classes = [
        'healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot',
        'soft_rot', 'yellow_disease', 'root_knot_nematode'
    ]
    
    if class_name not in valid_classes:
        print(f"❌ Invalid class name: {class_name}")
        print(f"Valid classes: {', '.join(valid_classes)}")
        return False
    
    # Set up paths
    data_dir = Path('data/raw/ginger_dataset')
    class_dir = data_dir / class_name
    source_path = Path(source_dir)
    
    # Create class directory if it doesn't exist
    class_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if source directory exists
    if not source_path.exists():
        print(f"❌ Source directory not found: {source_path}")
        return False
    
    # Get existing images in target directory
    existing_images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
    current_count = len(existing_images)
    
    print(f"  📊 Current images in {class_name}: {current_count}")
    
    # Find next available number
    next_number = current_count + 1
    
    # Get all image files from source
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
    source_images = []
    for ext in image_extensions:
        source_images.extend(source_path.glob(ext))
    
    if not source_images:
        print(f"❌ No image files found in {source_path}")
        return False
    
    print(f"  📸 Found {len(source_images)} images in source directory")
    
    # Copy images
    copied_count = 0
    for img_path in source_images:
        if target_count and copied_count >= target_count:
            break
            
        # Create new filename
        new_filename = f"{class_name}_{next_number:03d}.jpg"
        new_path = class_dir / new_filename
        
        try:
            # Copy file
            shutil.copy2(img_path, new_path)
            print(f"  ✅ Copied: {img_path.name} -> {new_filename}")
            next_number += 1
            copied_count += 1
            
        except Exception as e:
            print(f"  ❌ Error copying {img_path.name}: {e}")
    
    print(f"  🎉 Successfully added {copied_count} images to {class_name}")
    print(f"  📊 Total images in {class_name}: {current_count + copied_count}")
    
    return True

def list_dataset_status():
    """List current status of all disease classes"""
    print("📊 Current Dataset Status")
    print("=" * 50)
    
    data_dir = Path('data/raw/ginger_dataset')
    classes = [
        'healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot',
        'soft_rot', 'yellow_disease', 'root_knot_nematode'
    ]
    
    total_images = 0
    
    for class_name in classes:
        class_dir = data_dir / class_name
        if class_dir.exists():
            class_count = len(list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png')))
            total_images += class_count
            
            # Status indicator
            if class_count == 0:
                status = "❌ No images"
            elif class_count < 50:
                status = "⚠️  Need more"
            elif class_count < 100:
                status = "✅ Good"
            else:
                status = "🎉 Excellent"
            
            print(f"{class_name:20} {class_count:3d} images {status}")
        else:
            print(f"{class_name:20}   0 images ❌ No directory")
    
    print("-" * 50)
    print(f"{'Total':20} {total_images:3d} images")
    
    # Recommendations
    print("\n💡 Recommendations:")
    if total_images == 0:
        print("- Start by adding images to any class")
        print("- Use: python add_images.py --class healthy --source /path/to/images")
    elif total_images < 350:
        print("- Add more images to reach minimum of 50 per class")
        print("- Focus on classes with fewer images")
    else:
        print("- Dataset looks good! Ready for training")
        print("- Consider adding more images for better accuracy")

def interactive_mode():
    """Interactive mode for adding images"""
    print("🎯 Interactive Image Addition Mode")
    print("=" * 50)
    
    while True:
        print("\nOptions:")
        print("1. Add images to a class")
        print("2. View dataset status")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            # Get class name
            print("\nAvailable classes:")
            classes = [
                'healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot',
                'soft_rot', 'yellow_disease', 'root_knot_nematode'
            ]
            for i, cls in enumerate(classes, 1):
                print(f"{i}. {cls}")
            
            try:
                class_choice = int(input("Enter class number: ")) - 1
                if 0 <= class_choice < len(classes):
                    class_name = classes[class_choice]
                else:
                    print("❌ Invalid choice")
                    continue
            except ValueError:
                print("❌ Please enter a number")
                continue
            
            # Get source directory
            source_dir = input("Enter path to source images directory: ").strip()
            if not source_dir:
                print("❌ No source directory provided")
                continue
            
            # Get target count
            target_count_input = input("How many images to add? (press Enter for all): ").strip()
            target_count = None
            if target_count_input:
                try:
                    target_count = int(target_count_input)
                except ValueError:
                    print("❌ Invalid number, adding all images")
            
            # Add images
            add_images_to_class(class_name, source_dir, target_count)
            
        elif choice == '2':
            list_dataset_status()
            
        elif choice == '3':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Add images to GingerlyAI dataset')
    parser.add_argument('--class', dest='class_name', help='Disease class name')
    parser.add_argument('--source', help='Source directory containing images')
    parser.add_argument('--count', type=int, help='Number of images to add')
    parser.add_argument('--interactive', '-i', action='store_true', help='Run in interactive mode')
    parser.add_argument('--status', '-s', action='store_true', help='Show dataset status')
    
    args = parser.parse_args()
    
    if args.status:
        list_dataset_status()
    elif args.interactive:
        interactive_mode()
    elif args.class_name and args.source:
        add_images_to_class(args.class_name, args.source, args.count)
    else:
        print("🔍 GingerlyAI Image Addition Tool")
        print("=" * 50)
        print("Usage:")
        print("  python add_images.py --class healthy --source /path/to/images")
        print("  python add_images.py --interactive")
        print("  python add_images.py --status")
        print("\nFor help: python add_images.py --help")

if __name__ == "__main__":
    main()
