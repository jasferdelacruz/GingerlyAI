#!/usr/bin/env python3

"""
Advanced Synthetic Ginger Disease Dataset Generator
Creates realistic synthetic images with augmentation for ML training
Version: 2.0 - Production Ready
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import random
from pathlib import Path
import sys

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

def create_leaf_texture(image_size=(224, 224)):
    """Create realistic leaf-like texture as base"""
    img_array = np.zeros((image_size[0], image_size[1], 3), dtype=np.uint8)
    
    # Base green color with variation
    base_green_r = random.randint(30, 60)
    base_green_g = random.randint(100, 160)
    base_green_b = random.randint(30, 60)
    
    # Create gradient and texture
    for i in range(image_size[0]):
        for j in range(image_size[1]):
            # Add some natural variation
            variation = random.randint(-15, 15)
            r = np.clip(base_green_r + variation, 0, 255)
            g = np.clip(base_green_g + variation, 0, 255)
            b = np.clip(base_green_b + variation, 0, 255)
            img_array[i, j] = [r, g, b]
    
    # Add Gaussian noise for texture
    noise = np.random.normal(0, 10, img_array.shape)
    img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(img_array)
    
    # Apply slight blur for organic look
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    return img

def add_veins(img, draw, color=(40, 80, 40)):
    """Add leaf vein patterns"""
    width, height = img.size
    
    # Main central vein
    draw.line([(width//2, 0), (width//2, height)], fill=color, width=2)
    
    # Side veins
    for i in range(5, height-5, 30):
        offset = random.randint(-10, 10)
        draw.line([(width//2, i), (random.randint(0, width//4), i+offset)], fill=color, width=1)
        draw.line([(width//2, i), (random.randint(3*width//4, width), i+offset)], fill=color, width=1)

def create_sample_image(class_name, image_size=(224, 224), variation=0):
    """Create an advanced synthetic image for a given disease class"""
    
    # Create base leaf texture
    img = create_leaf_texture(image_size)
    draw = ImageDraw.Draw(img)
    
    # Add leaf veins for realism
    if random.random() > 0.3:  # 70% chance to add veins
        add_veins(img, draw)
    
    # Disease-specific modifications
    if class_name == 'healthy':
        # Keep mostly green, add slight variations
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(random.uniform(0.9, 1.1))
        
        # Add some random light spots (highlights)
        for _ in range(random.randint(5, 15)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(60, 100), random.randint(140, 180), random.randint(60, 100))
            radius = random.randint(3, 8)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
    
    elif class_name == 'bacterial_wilt':
        # Yellow/brown wilting patches
        for _ in range(random.randint(10, 25)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            # Brown/yellow colors for wilting
            color = (random.randint(120, 180), random.randint(90, 140), random.randint(40, 80))
            radius = random.randint(8, 20)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
        
        # Reduce overall brightness (wilted look)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(0.7)
    
    elif class_name == 'rhizome_rot':
        # Dark brown/black rotting areas
        for _ in range(random.randint(8, 18)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            # Dark brown/black colors
            color = (random.randint(30, 70), random.randint(20, 50), random.randint(15, 40))
            radius = random.randint(10, 25)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
        
        # Add some lighter brown edges (rot progression)
        for _ in range(random.randint(5, 10)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(80, 120), random.randint(60, 90), random.randint(40, 70))
            radius = random.randint(6, 15)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
    
    elif class_name == 'leaf_spot':
        # Multiple small circular spots
        num_spots = random.randint(15, 40)
        for _ in range(num_spots):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            # Dark brown spots with yellow halo
            radius = random.randint(3, 8)
            
            # Yellow halo
            halo_color = (random.randint(180, 220), random.randint(180, 220), random.randint(80, 120))
            draw.ellipse([x-radius-3, y-radius-3, x+radius+3, y+radius+3], fill=halo_color)
            
            # Dark center
            spot_color = (random.randint(60, 100), random.randint(40, 70), random.randint(30, 60))
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=spot_color)
    
    elif class_name == 'soft_rot':
        # Water-soaked, translucent appearance
        for _ in range(random.randint(12, 25)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            # Light brownish, watery colors
            color = (random.randint(140, 200), random.randint(140, 180), random.randint(100, 140))
            radius = random.randint(12, 22)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
        
        # Increase brightness slightly (water-soaked look)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.1)
    
    elif class_name == 'yellow_disease':
        # Overall yellowing with some green remaining
        img_array = np.array(img)
        
        # Shift colors toward yellow
        img_array[:, :, 0] = np.clip(img_array[:, :, 0] + random.randint(40, 80), 0, 255)  # More red
        img_array[:, :, 1] = np.clip(img_array[:, :, 1] + random.randint(30, 60), 0, 255)  # More green
        img_array[:, :, 2] = np.clip(img_array[:, :, 2] - random.randint(10, 30), 0, 255)  # Less blue
        
        img = Image.fromarray(img_array)
        
        # Add yellow patches
        draw = ImageDraw.Draw(img)
        for _ in range(random.randint(20, 40)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(200, 240), random.randint(200, 240), random.randint(60, 120))
            radius = random.randint(5, 15)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
    
    elif class_name == 'root_knot_nematode':
        # Stunted, stressed appearance with swellings
        for _ in range(random.randint(8, 15)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            # Brown/yellowish stress colors
            color = (random.randint(100, 150), random.randint(90, 130), random.randint(50, 90))
            radius = random.randint(10, 20)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
        
        # Add some swelling-like structures
        for _ in range(random.randint(3, 8)):
            x = random.randint(0, image_size[0])
            y = random.randint(0, image_size[1])
            color = (random.randint(80, 120), random.randint(70, 110), random.randint(40, 80))
            width = random.randint(8, 15)
            height = random.randint(15, 25)
            draw.ellipse([x-width, y-height, x+width, y+height], fill=color)
        
        # Reduce saturation (stressed plant)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.7)
    
    # Apply final realistic touches
    img = apply_augmentation(img, variation)
    
    return img

def apply_augmentation(img, variation=0):
    """Apply realistic augmentations to the image"""
    
    # Random rotation
    if random.random() > 0.5:
        angle = random.uniform(-15, 15)
        img = img.rotate(angle, fillcolor=(0, 0, 0))
    
    # Random flip
    if random.random() > 0.5:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    
    # Random brightness
    if random.random() > 0.3:
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(random.uniform(0.7, 1.3))
    
    # Random contrast
    if random.random() > 0.3:
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(random.uniform(0.8, 1.2))
    
    # Random saturation
    if random.random() > 0.3:
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(random.uniform(0.8, 1.2))
    
    # Add final noise
    img_array = np.array(img)
    noise = np.random.normal(0, random.randint(3, 8), img_array.shape)
    img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(img_array)
    
    return img

def create_sample_dataset(images_per_class=100):
    """Create comprehensive synthetic dataset with images for each class"""
    
    print("🌱 Creating Advanced Synthetic Ginger Disease Dataset")
    print("=" * 60)
    print(f"📊 Target: {images_per_class} images per class")
    print(f"📊 Total: {len(DISEASE_CLASSES) * images_per_class} images")
    print("=" * 60)
    
    # Create dataset directory
    dataset_dir = Path("data/raw/ginger_dataset")
    dataset_dir.mkdir(parents=True, exist_ok=True)
    
    # Create class directories
    for class_name in DISEASE_CLASSES:
        class_dir = dataset_dir / class_name
        class_dir.mkdir(exist_ok=True)
    
    # Generate sample images with progress tracking
    total_images = 0
    
    for class_name in DISEASE_CLASSES:
        print(f"\n🎨 Generating {images_per_class} images for '{class_name}'...")
        
        class_dir = dataset_dir / class_name
        
        for i in range(images_per_class):
            try:
                # Create sample image with variation
                img = create_sample_image(class_name, variation=i)
                
                # Save image
                filename = f"{class_name}_{i:05d}.jpg"
                img_path = class_dir / filename
                img.save(img_path, "JPEG", quality=85)
                
                total_images += 1
                
                # Progress indicator
                if (i + 1) % 20 == 0:
                    progress = (i + 1) / images_per_class * 100
                    print(f"  ✅ Generated {i+1}/{images_per_class} images ({progress:.0f}%)")
                    
            except Exception as e:
                print(f"  ❌ Error creating image {i}: {e}")
    
    print(f"\n" + "=" * 60)
    print(f"🎉 Synthetic Dataset Created Successfully!")
    print("=" * 60)
    print(f"📁 Location: {dataset_dir}")
    print(f"📊 Total images: {total_images}")
    print(f"📊 Images per class: {images_per_class}")
    
    # Show directory structure
    print(f"\n📂 Dataset Structure:")
    for class_name in DISEASE_CLASSES:
        class_dir = dataset_dir / class_name
        image_count = len(list(class_dir.glob("*.jpg")))
        status = "✅" if image_count >= 50 else "⚠️"
        print(f"  {status} {class_name}/: {image_count} images")
    
    return True

def main():
    """Main function"""
    print("🔬 Advanced Synthetic Dataset Generator")
    print("Version: 2.0\n")
    
    # Get user input for number of images
    print("How many images per class do you want to generate?")
    print("  - Minimum: 50 (for testing)")
    print("  - Recommended: 100 (good training)")
    print("  - Optimal: 200 (best results)")
    
    try:
        if len(sys.argv) > 1:
            images_per_class = int(sys.argv[1])
        else:
            user_input = input("\nEnter number (default: 100): ").strip()
            images_per_class = int(user_input) if user_input else 100
        
        if images_per_class < 10:
            print("⚠️ Warning: Too few images. Setting to minimum of 50.")
            images_per_class = 50
        elif images_per_class > 500:
            print("⚠️ Warning: Very large dataset. This may take a while...")
        
        print(f"\n✅ Creating {images_per_class} images per class...\n")
        
        success = create_sample_dataset(images_per_class)
        
        if success:
            print(f"\n🚀 Next Steps:")
            print(f"1. Validate images: python validate_images.py")
            print(f"2. Run preprocessing: python data_preprocessing.py")
            print(f"3. Train model: python cnn_model_training.py")
            print(f"\n💡 Tip: This is synthetic data. For best results, replace")
            print(f"   with real ginger disease images when available.")
        
    except ValueError:
        print("❌ Invalid input. Please enter a number.")
        return False
    except KeyboardInterrupt:
        print("\n\n❌ Generation cancelled by user.")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()

