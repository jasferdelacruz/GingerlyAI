"""
Configuration file for Ginger Disease Detection ML Training Pipeline
"""
import os
from pathlib import Path

# Project Structure
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "logs"
EXPORTS_DIR = BASE_DIR / "exports"

# Create directories
for directory in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR, LOGS_DIR, EXPORTS_DIR]:
    directory.mkdir(exist_ok=True, parents=True)

# Disease Classes for Ginger
DISEASE_CLASSES = [
    'healthy',
    'bacterial_wilt',
    'rhizome_rot',
    'leaf_spot',
    'soft_rot',
    'yellow_disease',
    'root_knot_nematode'
]

NUM_CLASSES = len(DISEASE_CLASSES)

# CNN Model Training Configuration
TRAINING_CONFIG = {
    # Data
    'img_height': 224,
    'img_width': 224,
    'channels': 3,
    'batch_size': 32,
    'validation_split': 0.2,
    'test_split': 0.1,
    
    # Training
    'epochs': 50,
    'learning_rate': 0.001,
    'early_stopping_patience': 10,
    'reduce_lr_patience': 5,
    'reduce_lr_factor': 0.5,
    'min_lr': 1e-7,
    
    # Data Augmentation
    'rotation_range': 25,
    'width_shift_range': 0.1,
    'height_shift_range': 0.1,
    'horizontal_flip': True,
    'vertical_flip': False,
    'zoom_range': 0.2,
    'shear_range': 0.2,
    'brightness_range': [0.8, 1.2],
    'fill_mode': 'nearest',
    
    # CNN Architecture Configuration
    'model_type': 'cnn',  # Primary approach: CNN
    'cnn_architecture': {
        'conv_layers': [
            {'filters': 32, 'kernel_size': (5, 5), 'strides': 2, 'activation': 'relu'},
            {'filters': 32, 'kernel_size': (3, 3), 'strides': 1, 'activation': 'relu'},
            {'filters': 128, 'kernel_size': (3, 3), 'strides': 1, 'activation': 'relu'},
            {'filters': 64, 'kernel_size': (5, 5), 'strides': 2, 'activation': 'relu'},
            {'filters': 32, 'kernel_size': (3, 3), 'strides': 1, 'activation': 'relu'},
        ],
        'pooling_layers': [
            {'pool_size': (3, 3), 'strides': 1},
            {'pool_size': (2, 2), 'strides': 1},
            {'pool_size': (2, 2), 'strides': 2},
        ],
        'dense_layers': [
            {'units': 64, 'activation': 'relu', 'dropout': 0.3},
            {'units': 32, 'activation': 'relu', 'dropout': 0.3},
        ],
        'output_units': NUM_CLASSES,
        'output_activation': 'softmax'
    },
    
    # Alternative: Hybrid CNN + Transfer Learning
    'hybrid_cnn': {
        'base_model': 'MobileNetV2',
        'base_weights': 'imagenet',
        'include_top': False,
        'freeze_base': True,
        'custom_head': {
            'dense_layers': [
                {'units': 128, 'activation': 'relu', 'dropout': 0.3},
                {'units': 64, 'activation': 'relu', 'dropout': 0.3},
            ],
            'output_units': NUM_CLASSES,
            'output_activation': 'softmax'
        }
    },
    
    # Model Architecture
    'dropout_rate': 0.3,
    'l2_regularization': 0.001,
    'use_pretrained': False,  # CNN-first approach
    'freeze_base_layers': False,
    'fine_tune_from_layer': None,
}

# Model Export Configuration
EXPORT_CONFIG = {
    'tensorflowjs_format': True,
    'quantization': True,
    'optimization': 'speed',  # or 'size'
    'model_format': 'graph_model',  # or 'layers_model'
    'metadata': {
        'name': 'GingerDiseaseDetector',
        'version': '1.0.0',
        'description': 'CNN model for detecting diseases in ginger plants',
        'input_shape': [224, 224, 3],
        'output_classes': DISEASE_CLASSES,
        'preprocessing': {
            'normalization': 'rescale_1_255',
            'resize_method': 'bilinear'
        }
    }
}

# Paths
DATASET_PATH = RAW_DATA_DIR / "ginger_dataset"
PROCESSED_DATASET_PATH = PROCESSED_DATA_DIR / "ginger_processed"
MODEL_SAVE_PATH = MODELS_DIR / "ginger_disease_model.h5"
TENSORFLOWJS_EXPORT_PATH = EXPORTS_DIR / "tfjs_model"
TENSORBOARD_LOG_DIR = LOGS_DIR / "tensorboard"

# API Configuration (for uploading to backend)
API_CONFIG = {
    'backend_url': 'http://localhost:3000/api',
    'upload_endpoint': '/models',
    'admin_credentials': {
        'email': 'admin@gingerlyai.com',
        'password': 'admin_password'  # Change in production
    }
}
