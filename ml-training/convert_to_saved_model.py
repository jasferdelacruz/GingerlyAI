#!/usr/bin/env python3

"""
Convert H5 model to SavedModel format, then to TensorFlow.js
"""

import tensorflow as tf
from tensorflow import keras
import os
from pathlib import Path

def convert_h5_to_saved_model():
    """Convert H5 model to SavedModel format"""
    print("🔄 Converting H5 to SavedModel format...")
    print("=" * 60)
    
    h5_path = "models/ginger_disease_model.h5"
    saved_model_path = "exports/saved_model"
    
    if not os.path.exists(h5_path):
        print(f"❌ Model not found: {h5_path}")
        return False
    
    try:
        # Load H5 model
        print(f"📂 Loading model from: {h5_path}")
        model = keras.models.load_model(h5_path)
        
        print(f"✅ Model loaded successfully")
        print(f"📊 Input shape: {model.input_shape}")
        print(f"📊 Output shape: {model.output_shape}")
        
        # Save as SavedModel
        print(f"\n💾 Saving as SavedModel to: {saved_model_path}")
        Path(saved_model_path).mkdir(parents=True, exist_ok=True)
        
        # Use TensorFlow's save API for Keras 3
        tf.saved_model.save(model, saved_model_path)
        
        print(f"✅ SavedModel created successfully!")
        
        # Verify saved model
        if os.path.exists(os.path.join(saved_model_path, 'saved_model.pb')):
            print(f"✅ saved_model.pb exists")
        
        if os.path.exists(os.path.join(saved_model_path, 'variables')):
            print(f"✅ variables directory exists")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def convert_to_tfjs():
    """Convert SavedModel to TensorFlow.js format"""
    print("\n🔄 Converting SavedModel to TensorFlow.js...")
    print("=" * 60)
    
    saved_model_path = "exports/saved_model"
    tfjs_path = "exports/tfjs_model"
    
    if not os.path.exists(saved_model_path):
        print(f"❌ SavedModel not found: {saved_model_path}")
        return False
    
    try:
        import tensorflowjs as tfjs
        
        print(f"📂 Input: {saved_model_path}")
        print(f"📂 Output: {tfjs_path}")
        
        # Convert using tensorflowjs
        tfjs.converters.convert_tf_saved_model(
            saved_model_path,
            tfjs_path
        )
        
        print(f"\n✅ TensorFlow.js model created successfully!")
        
        # Check files
        model_json = os.path.join(tfjs_path, 'model.json')
        if os.path.exists(model_json):
            print(f"✅ model.json created")
            
            # Count weight files
            weight_files = list(Path(tfjs_path).glob('*.bin'))
            print(f"✅ {len(weight_files)} weight file(s) created")
            
            # Get total size
            total_size = sum(f.stat().st_size for f in Path(tfjs_path).iterdir() if f.is_file())
            print(f"📦 Total size: {total_size / (1024*1024):.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_model_info():
    """Create model configuration file"""
    import json
    
    try:
        tfjs_path = "exports/tfjs_model"
        
        model_info = {
            "modelType": "hybrid_cnn_mobilenetv2",
            "inputShape": [224, 224, 3],
            "outputShape": [7],
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
                "rescale": "1/255",
                "resize": [224, 224],
                "normalize": True
            },
            "metadata": {
                "framework": "tensorflow",
                "version": "1.0.0",
                "created": "2025-10-28",
                "accuracy": "92.86%"
            }
        }
        
        info_path = os.path.join(tfjs_path, 'model_info.json')
        with open(info_path, 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print(f"\n✅ Model info saved: {info_path}")
        return True
        
    except Exception as e:
        print(f"⚠️ Warning: Could not create model info: {e}")
        return False

def main():
    """Main function"""
    print("🤖 Model Export Pipeline")
    print("=" * 60)
    
    # Step 1: Convert to SavedModel
    if not convert_h5_to_saved_model():
        print("\n❌ Failed to convert to SavedModel")
        return False
    
    # Step 2: Convert to TensorFlow.js
    if not convert_to_tfjs():
        print("\n❌ Failed to convert to TensorFlow.js")
        return False
    
    # Step 3: Create model info
    create_model_info()
    
    print("\n" + "=" * 60)
    print("🎉 Model Export Complete!")
    print("=" * 60)
    print("\n📁 Exported model: exports/tfjs_model/")
    print("\n📋 Files created:")
    print("  - model.json (model architecture)")
    print("  - *.bin files (model weights)")
    print("  - model_info.json (model metadata)")
    print("\n🚀 Next Steps:")
    print("1. Copy exports/tfjs_model/ to your mobile app's assets folder")
    print("2. Load the model using TensorFlow.js in your Ionic app")
    print("3. Test predictions with sample images")
    
    return True

if __name__ == "__main__":
    main()

