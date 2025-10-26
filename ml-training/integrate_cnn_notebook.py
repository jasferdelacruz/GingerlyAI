#!/usr/bin/env python3

"""
CNN Notebook Integration Script
Adapts the downloaded CNN notebook for our 7-class ginger disease detection system
"""

import os
import cv2
import numpy as np
from pathlib import Path
from sklearn.preprocessing import LabelBinarizer
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import json

# Import our existing modules
from config import *
from data_preprocessing import GingerDataPreprocessor

class CNNNotebookIntegrator:
    def __init__(self):
        self.target_size = (224, 224)  # Our target size vs notebook's 128x128
        self.disease_classes = DISEASE_CLASSES  # Our 7 classes vs notebook's 2
        self.preprocessor = GingerDataPreprocessor()
        
    def convert_image_to_array(self, image_dir, target_size=None):
        """
        Adapted from the notebook - converts image to array with our target size
        """
        if target_size is None:
            target_size = self.target_size
            
        try:
            image = cv2.imread(image_dir)
            if image is not None:
                image = cv2.resize(image, target_size)
                return img_to_array(image)
            else:
                return np.array([])
        except Exception as e:
            print(f"Error loading {image_dir}: {e}")
            return None
    
    def load_dataset_from_notebook_structure(self, dataset_path):
        """
        Load dataset using the notebook's approach but adapted for our 7 classes
        """
        print("[INFO] Loading images using notebook approach...")
        
        image_list, label_list = [], []
        
        try:
            # Use our dataset structure
            for disease_class in self.disease_classes:
                class_dir = Path(dataset_path) / disease_class
                
                if not class_dir.exists():
                    print(f"[WARNING] Directory not found: {class_dir}")
                    continue
                
                print(f"[INFO] Processing {disease_class}...")
                
                # Get all image files
                image_files = []
                for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
                    image_files.extend(class_dir.glob(ext))
                
                for image_file in image_files:
                    image_array = self.convert_image_to_array(str(image_file))
                    if image_array is not None and len(image_array) > 0:
                        image_list.append(image_array)
                        label_list.append(disease_class)
                
                print(f"[INFO] Loaded {len(image_files)} images for {disease_class}")
            
            print(f"[INFO] Total images loaded: {len(image_list)}")
            return image_list, label_list
            
        except Exception as e:
            print(f"[ERROR] Failed to load dataset: {e}")
            return [], []
    
    def create_adapted_cnn_architecture(self, input_shape, num_classes):
        """
        Create CNN architecture adapted from the notebook for multi-class
        """
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Conv2D, MaxPooling2D, Activation, Flatten, Dense, Dropout
        from tensorflow.keras.optimizers import Adam
        
        model = Sequential()
        
        # Adapted architecture for 224x224 input and 7 classes
        model.add(Conv2D(32, (5, 5), strides=2, input_shape=input_shape))
        model.add(Activation('relu'))
        model.add(MaxPooling2D(pool_size=(3, 3), strides=1))
        
        model.add(Conv2D(32, (3, 3), strides=1))
        model.add(Activation('relu'))
        model.add(MaxPooling2D(pool_size=(2, 2), strides=1))
        
        model.add(Conv2D(128, (3, 3), strides=1))
        model.add(Activation('relu'))
        
        model.add(Conv2D(64, (5, 5), strides=2))
        model.add(Activation('relu'))
        
        model.add(Conv2D(32, (3, 3), strides=1))
        model.add(Activation('relu'))
        model.add(MaxPooling2D(pool_size=(2, 2), strides=2))
        
        model.add(Flatten())
        model.add(Dense(64))  # Increased from 32
        model.add(Activation('relu'))
        model.add(Dropout(0.3))  # Increased dropout
        
        model.add(Dense(32))  # Increased from 8
        model.add(Activation('relu'))
        model.add(Dropout(0.3))
        
        # Multi-class output instead of binary
        model.add(Dense(num_classes))
        model.add(Activation('softmax'))  # Changed from sigmoid
        
        return model
    
    def create_hybrid_model(self, input_shape, num_classes):
        """
        Create a hybrid model combining notebook approach with transfer learning
        """
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
        from tensorflow.keras.models import Model
        
        # Use MobileNetV2 as base (good for mobile deployment)
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=input_shape
        )
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Add custom head
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(128, activation='relu')(x)
        x = Dropout(0.3)(x)
        x = Dense(64, activation='relu')(x)
        x = Dropout(0.3)(x)
        predictions = Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)
        
        return model, base_model
    
    def train_adapted_model(self, dataset_path, model_type='cnn'):
        """
        Train model using adapted notebook approach
        """
        print(f"[INFO] Training {model_type} model...")
        
        # Load dataset
        image_list, label_list = self.load_dataset_from_notebook_structure(dataset_path)
        
        if len(image_list) == 0:
            print("[ERROR] No images loaded!")
            return None
        
        # Prepare data
        print("[INFO] Preparing data...")
        
        # Convert to numpy arrays
        np_image_list = np.array(image_list, dtype=np.float32) / 255.0
        
        # Encode labels
        label_binarizer = LabelBinarizer()
        image_labels = label_binarizer.fit_transform(label_list)
        n_classes = len(label_binarizer.classes_)
        
        print(f"[INFO] Classes: {label_binarizer.classes_}")
        print(f"[INFO] Number of classes: {n_classes}")
        print(f"[INFO] Image shape: {np_image_list.shape}")
        
        # Split data
        x_train, x_test, y_train, y_test = train_test_split(
            np_image_list, image_labels, 
            test_size=0.2, random_state=42
        )
        
        print(f"[INFO] Training set: {x_train.shape[0]} images")
        print(f"[INFO] Test set: {x_test.shape[0]} images")
        
        # Create model
        input_shape = (self.target_size[0], self.target_size[1], 3)
        
        if model_type == 'cnn':
            model = self.create_adapted_cnn_architecture(input_shape, n_classes)
        elif model_type == 'hybrid':
            model, base_model = self.create_hybrid_model(input_shape, n_classes)
        else:
            raise ValueError("model_type must be 'cnn' or 'hybrid'")
        
        # Compile model
        from tensorflow.keras.optimizers import Adam
        
        model.compile(
            optimizer=Adam(learning_rate=1e-3),
            loss='categorical_crossentropy',  # Multi-class
            metrics=['accuracy']
        )
        
        print(f"[INFO] Model created: {model_type}")
        model.summary()
        
        # Data augmentation
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        
        aug = ImageDataGenerator(
            rotation_range=25,
            width_shift_range=0.1,
            height_shift_range=0.1,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode="nearest"
        )
        
        # Training parameters
        epochs = 30
        batch_size = 32  # Reduced for 224x224 images
        
        print(f"[INFO] Starting training...")
        print(f"[INFO] Epochs: {epochs}, Batch size: {batch_size}")
        
        # Train model
        history = model.fit(
            aug.flow(x_train, y_train, batch_size=batch_size),
            validation_data=(x_test, y_test),
            steps_per_epoch=len(x_train) // batch_size,
            epochs=epochs,
            verbose=1
        )
        
        # Evaluate model
        print("[INFO] Evaluating model...")
        scores = model.evaluate(x_test, y_test, verbose=0)
        print(f"[INFO] Test Accuracy: {scores[1]*100:.2f}%")
        
        # Save model
        model_path = f"models/ginger_{model_type}_model.h5"
        os.makedirs("models", exist_ok=True)
        model.save(model_path)
        print(f"[INFO] Model saved to: {model_path}")
        
        # Save label encoder
        import pickle
        with open(f"models/label_encoder_{model_type}.pkl", 'wb') as f:
            pickle.dump(label_binarizer, f)
        
        # Plot training history
        self.plot_training_history(history, model_type)
        
        return model, history, label_binarizer
    
    def plot_training_history(self, history, model_type):
        """Plot training history"""
        try:
            acc = history.history['accuracy']
            val_acc = history.history['val_accuracy']
            loss = history.history['loss']
            val_loss = history.history['val_loss']
            epochs = range(1, len(acc) + 1)
            
            plt.figure(figsize=(12, 4))
            
            plt.subplot(1, 2, 1)
            plt.plot(epochs, acc, 'b', label='Training accuracy')
            plt.plot(epochs, val_acc, 'r', label='Validation accuracy')
            plt.title(f'{model_type.upper()} - Training and Validation Accuracy')
            plt.legend()
            
            plt.subplot(1, 2, 2)
            plt.plot(epochs, loss, 'b', label='Training loss')
            plt.plot(epochs, val_loss, 'r', label='Validation loss')
            plt.title(f'{model_type.upper()} - Training and Validation Loss')
            plt.legend()
            
            plt.tight_layout()
            plt.savefig(f'models/training_history_{model_type}.png')
            plt.show()
            
        except Exception as e:
            print(f"[WARNING] Could not plot training history: {e}")
    
    def compare_approaches(self, dataset_path):
        """
        Compare different approaches: CNN, Hybrid, and our existing transfer learning
        """
        print("[INFO] Comparing different model approaches...")
        
        approaches = ['cnn', 'hybrid']
        results = {}
        
        for approach in approaches:
            print(f"\n{'='*50}")
            print(f"Training {approach.upper()} model...")
            print('='*50)
            
            try:
                model, history, label_encoder = self.train_adapted_model(
                    dataset_path, model_type=approach
                )
                
                # Get final accuracy
                final_acc = history.history['val_accuracy'][-1]
                results[approach] = {
                    'model': model,
                    'accuracy': final_acc,
                    'history': history,
                    'label_encoder': label_encoder
                }
                
                print(f"[INFO] {approach.upper()} - Final Validation Accuracy: {final_acc*100:.2f}%")
                
            except Exception as e:
                print(f"[ERROR] Failed to train {approach} model: {e}")
                results[approach] = None
        
        # Summary
        print(f"\n{'='*50}")
        print("COMPARISON SUMMARY")
        print('='*50)
        
        for approach, result in results.items():
            if result:
                print(f"{approach.upper()}: {result['accuracy']*100:.2f}% accuracy")
            else:
                print(f"{approach.upper()}: Failed to train")
        
        return results

def main():
    """Main function"""
    print("🔗 CNN Notebook Integration Tool")
    print("=" * 50)
    
    # Initialize integrator
    integrator = CNNNotebookIntegrator()
    
    # Check if dataset exists
    dataset_path = "data/raw/ginger_dataset"
    if not Path(dataset_path).exists():
        print(f"[ERROR] Dataset directory not found: {dataset_path}")
        print("Please add images to the dataset first using add_images.py")
        return
    
    # Check if we have images
    total_images = 0
    for class_name in integrator.disease_classes:
        class_dir = Path(dataset_path) / class_name
        if class_dir.exists():
            class_count = len(list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png')))
            total_images += class_count
            print(f"{class_name}: {class_count} images")
    
    if total_images == 0:
        print("[ERROR] No images found in dataset!")
        print("Please add images first using: python add_images.py --interactive")
        return
    
    print(f"\nTotal images: {total_images}")
    
    # Ask user what to do
    print("\nOptions:")
    print("1. Train CNN model (adapted from notebook)")
    print("2. Train Hybrid model (CNN + Transfer Learning)")
    print("3. Compare both approaches")
    print("4. Exit")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        integrator.train_adapted_model(dataset_path, model_type='cnn')
    elif choice == '2':
        integrator.train_adapted_model(dataset_path, model_type='hybrid')
    elif choice == '3':
        integrator.compare_approaches(dataset_path)
    elif choice == '4':
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice!")

if __name__ == "__main__":
    main()
