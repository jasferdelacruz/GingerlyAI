#!/usr/bin/env python3

"""
Complete AI Model Setup Script for GingerlyAI
This script helps you set up the dataset and train the AI model
"""

import os
import sys
from pathlib import Path
import subprocess

def check_environment():
    """Check if all required packages are installed"""
    print("🔍 Checking Python environment...")
    
    required_packages = [
        'tensorflow', 'keras', 'numpy', 'pandas', 'opencv-python', 
        'pillow', 'scikit-learn', 'albumentations', 'matplotlib', 
        'seaborn', 'tqdm', 'tensorflowjs'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All packages installed!")
    return True

def setup_dataset_structure():
    """Set up the dataset directory structure"""
    print("\n📁 Setting up dataset structure...")
    
    data_dir = Path('data/raw/ginger_dataset')
    classes = [
        'healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot',
        'soft_rot', 'yellow_disease', 'root_knot_nematode'
    ]
    
    for class_name in classes:
        class_dir = data_dir / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        print(f"📁 Created: {class_dir}")
    
    # Create instructions file
    instructions = """
# 📸 Dataset Collection Instructions

## Image Requirements:
- **Format**: JPG, PNG, or JPEG
- **Size**: Minimum 224x224 pixels (will be resized automatically)
- **Quality**: Clear, well-lit images
- **Quantity**: At least 50-100 images per class for good results

## Disease Classes:
1. **healthy** - Healthy ginger plants with no visible disease
2. **bacterial_wilt** - Plants showing wilting, yellowing, stunted growth
3. **rhizome_rot** - Rhizomes with soft, mushy, discolored areas
4. **leaf_spot** - Leaves with circular or irregular spots
5. **soft_rot** - Soft, water-soaked lesions on plant parts
6. **yellow_disease** - Yellowing of leaves, stunted growth
7. **root_knot_nematode** - Root galls, stunted growth, yellowing

## Collection Tips:
- Take photos in good lighting
- Include different angles and growth stages
- Capture both close-up and full plant views
- Ensure images are in focus
- Avoid blurry or dark images

## File Naming:
- Use descriptive names: `healthy_plant_001.jpg`
- Avoid special characters in filenames
- Keep names consistent within each class
"""
    
    with open(data_dir / 'COLLECTION_INSTRUCTIONS.md', 'w') as f:
        f.write(instructions)
    
    print("✅ Dataset structure created!")
    print(f"📝 Instructions saved to: {data_dir / 'COLLECTION_INSTRUCTIONS.md'}")

def create_sample_data():
    """Create sample data for testing (if no real data available)"""
    print("\n🎨 Creating sample data for testing...")
    
    try:
        import numpy as np
        from PIL import Image
        
        data_dir = Path('data/raw/ginger_dataset')
        classes = ['healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot', 'soft_rot', 'yellow_disease', 'root_knot_nematode']
        
        for class_name in classes:
            class_dir = data_dir / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            
            # Create 5 sample images per class
            for i in range(5):
                # Create a random colored image
                img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                img = Image.fromarray(img_array)
                img_path = class_dir / f'sample_{class_name}_{i+1:03d}.jpg'
                img.save(img_path)
            
            print(f"📁 Created 5 sample images for {class_name}")
        
        print("✅ Sample data created! (Replace with real images for actual training)")
        
    except ImportError:
        print("⚠️  Cannot create sample data - missing PIL or numpy")

def run_preprocessing():
    """Run the data preprocessing pipeline"""
    print("\n🔄 Running data preprocessing...")
    
    try:
        result = subprocess.run([sys.executable, 'data_preprocessing.py'], 
                              capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            print("✅ Data preprocessing completed successfully!")
            print(result.stdout)
        else:
            print("❌ Data preprocessing failed!")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error running preprocessing: {e}")
        return False
    
    return True

def run_training():
    """Run the CNN model training"""
    print("\n🤖 Starting CNN model training...")
    
    try:
        result = subprocess.run([sys.executable, 'cnn_model_training.py'], 
                              capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            print("✅ CNN model training completed successfully!")
            print(result.stdout)
        else:
            print("❌ CNN model training failed!")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error running CNN training: {e}")
        return False
    
    return True

def run_export():
    """Export model to TensorFlow.js format"""
    print("\n📱 Exporting model to TensorFlow.js...")
    
    try:
        result = subprocess.run([sys.executable, 'model_export.py'], 
                              capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            print("✅ Model export completed successfully!")
            print(result.stdout)
        else:
            print("❌ Model export failed!")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error running export: {e}")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 GingerlyAI CNN Model Setup")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        print("\n❌ Please install missing packages first!")
        return
    
    # Setup dataset structure
    setup_dataset_structure()
    
    # Ask user what they want to do
    print("\n" + "=" * 50)
    print("What would you like to do?")
    print("1. Create sample data for testing")
    print("2. Add real images to dataset (manual)")
    print("3. Run preprocessing on existing data")
    print("4. Train CNN model")
    print("5. Export model to TensorFlow.js")
    print("6. Run complete CNN pipeline (preprocessing + training + export)")
    
    choice = input("\nEnter your choice (1-6): ").strip()
    
    if choice == '1':
        create_sample_data()
    elif choice == '2':
        print("\n📸 Please add your images to the following directories:")
        data_dir = Path('data/raw/ginger_dataset')
        for class_name in ['healthy', 'bacterial_wilt', 'rhizome_rot', 'leaf_spot', 'soft_rot', 'yellow_disease', 'root_knot_nematode']:
            print(f"   📁 {data_dir / class_name}")
        print("\nAfter adding images, run this script again and choose option 3-6")
    elif choice == '3':
        run_preprocessing()
    elif choice == '4':
        run_training()
    elif choice == '5':
        run_export()
    elif choice == '6':
        print("🔄 Running complete pipeline...")
        if run_preprocessing():
            if run_training():
                run_export()
    else:
        print("❌ Invalid choice!")
    
    print("\n✅ Setup complete!")

if __name__ == "__main__":
    main()
