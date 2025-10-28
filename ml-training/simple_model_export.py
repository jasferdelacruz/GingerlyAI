#!/usr/bin/env python3

"""
Simple Model Export to TensorFlow.js
Converts the trained H5 model to TensorFlow.js format
"""

import os
import json
import subprocess
from pathlib import Path

# Paths
MODEL_PATH = "models/ginger_disease_model.h5"
EXPORT_DIR = "exports/tfjs_model"

def export_model():
    """Export model using tensorflowjs_converter command"""
    print("🔄 Exporting Model to TensorFlow.js Format")
    print("=" * 60)
    
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found: {MODEL_PATH}")
        return False
    
    # Create export directory
    Path(EXPORT_DIR).mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Model: {MODEL_PATH}")
    print(f"📁 Export to: {EXPORT_DIR}")
    
    try:
        # Find the tensorflowjs_converter script
        import sys
        scripts_dir = os.path.join(os.path.dirname(sys.executable), 'Scripts')
        converter_path = os.path.join(scripts_dir, 'tensorflowjs_converter.exe')
        
        if not os.path.exists(converter_path):
            # Try without .exe
            converter_path = os.path.join(scripts_dir, 'tensorflowjs_converter')
            
        if not os.path.exists(converter_path):
            # Try user scripts
            user_scripts = os.path.expanduser(r'~\AppData\Roaming\Python\Python313\Scripts')
            converter_path = os.path.join(user_scripts, 'tensorflowjs_converter.exe')
        
        print(f"\n🔍 Using converter: {converter_path}")
        
        # Run converter
        cmd = [
            converter_path,
            '--input_format=keras',
            '--output_format=tfjs_layers_model',
            MODEL_PATH,
            EXPORT_DIR
        ]
        
        print(f"\n🚀 Running conversion...")
        print(f"Command: {' '.join(cmd)}\n")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            shell=True
        )
        
        if result.returncode == 0:
            print("✅ Model exported successfully!")
            print(f"\n📊 Output:")
            print(result.stdout)
            
            # Check exported files
            model_json = os.path.join(EXPORT_DIR, 'model.json')
            if os.path.exists(model_json):
                print(f"\n✅ model.json created")
                
                # Count weight files
                weight_files = list(Path(EXPORT_DIR).glob('group*.bin'))
                print(f"✅ {len(weight_files)} weight file(s) created")
                
                # Get file sizes
                total_size = sum(f.stat().st_size for f in Path(EXPORT_DIR).iterdir())
                print(f"📦 Total size: {total_size / (1024*1024):.2f} MB")
                
            return True
        else:
            print("❌ Conversion failed!")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error during export: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_model_info():
    """Create model info JSON file"""
    try:
        # Load metadata if exists
        metadata_path = "models/model_metadata.json"
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {}
        
        # Create model info
        model_info = {
            "model_type": "hybrid_cnn",
            "input_shape": [224, 224, 3],
            "classes": [
                "bacterial_wilt",
                "healthy", 
                "leaf_spot",
                "rhizome_rot",
                "root_knot_nematode",
                "soft_rot",
                "yellow_disease"
            ],
            "preprocessing": {
                "rescale": 1.0 / 255.0,
                "resize": [224, 224]
            },
            "version": "1.0.0",
            **metadata
        }
        
        # Save model info
        info_path = os.path.join(EXPORT_DIR, 'model_info.json')
        with open(info_path, 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print(f"\n✅ Model info saved: {info_path}")
        return True
        
    except Exception as e:
        print(f"⚠️ Warning: Could not create model info: {e}")
        return False

def main():
    """Main function"""
    success = export_model()
    
    if success:
        create_model_info()
        
        print("\n" + "=" * 60)
        print("🎉 Model Export Complete!")
        print("=" * 60)
        print(f"\n📁 Exported files location: {EXPORT_DIR}")
        print("\n📋 Next Steps:")
        print("1. Copy the tfjs_model folder to your mobile app")
        print("2. Load the model in your Ionic React app using TensorFlow.js")
        print("3. Test the model with sample images")
        
        return True
    else:
        print("\n❌ Export failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    main()

