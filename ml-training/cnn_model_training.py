#!/usr/bin/env python3

"""
CNN-First Model Training Pipeline for Ginger Disease Detection
Primary approach using custom CNN architecture
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, optimizers, callbacks
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import pandas as pd
from pathlib import Path

from config import *

class CNNGingerDiseaseModel:
    def __init__(self):
        self.model = None
        self.history = None
        self.img_height = TRAINING_CONFIG['img_height']
        self.img_width = TRAINING_CONFIG['img_width']
        self.num_classes = NUM_CLASSES
        self.class_names = DISEASE_CLASSES
        self.model_type = TRAINING_CONFIG['model_type']
        
    def create_cnn_model(self):
        """Create custom CNN model based on notebook architecture"""
        print("🏗️  Creating CNN model...")
        
        input_shape = (self.img_height, self.img_width, 3)
        cnn_config = TRAINING_CONFIG['cnn_architecture']
        
        model = keras.Sequential()
        
        # Input layer
        model.add(layers.Input(shape=input_shape))
        
        # Convolutional layers
        conv_layers = cnn_config['conv_layers']
        pool_layers = cnn_config['pooling_layers']
        
        for i, conv_config in enumerate(conv_layers):
            # Add Conv2D layer
            model.add(layers.Conv2D(
                filters=conv_config['filters'],
                kernel_size=conv_config['kernel_size'],
                strides=conv_config['strides'],
                padding='same'
            ))
            model.add(layers.Activation(conv_config['activation']))
            
            # Add pooling layer if available
            if i < len(pool_layers):
                pool_config = pool_layers[i]
                model.add(layers.MaxPooling2D(
                    pool_size=pool_config['pool_size'],
                    strides=pool_config['strides']
                ))
        
        # Flatten and Dense layers
        model.add(layers.Flatten())
        
        # Dense layers
        for dense_config in cnn_config['dense_layers']:
            model.add(layers.Dense(dense_config['units']))
            model.add(layers.Activation(dense_config['activation']))
            model.add(layers.Dropout(dense_config['dropout']))
        
        # Output layer
        model.add(layers.Dense(cnn_config['output_units']))
        model.add(layers.Activation(cnn_config['output_activation']))
        
        return model
    
    def create_hybrid_cnn_model(self):
        """Create hybrid CNN model with transfer learning"""
        print("🏗️  Creating Hybrid CNN model...")
        
        input_shape = (self.img_height, self.img_width, 3)
        hybrid_config = TRAINING_CONFIG['hybrid_cnn']
        
        # Base model
        if hybrid_config['base_model'] == 'MobileNetV2':
            base_model = keras.applications.MobileNetV2(
                weights=hybrid_config['base_weights'],
                include_top=hybrid_config['include_top'],
                input_shape=input_shape
            )
        else:
            raise ValueError(f"Unsupported base model: {hybrid_config['base_model']}")
        
        # Freeze base model if specified
        if hybrid_config['freeze_base']:
            base_model.trainable = False
        
        # Create model
        inputs = keras.Input(shape=input_shape)
        x = base_model(inputs, training=False)
        
        # Add GlobalAveragePooling2D to flatten the output
        x = layers.GlobalAveragePooling2D()(x)
        
        # Custom head
        custom_head = hybrid_config['custom_head']
        for dense_config in custom_head['dense_layers']:
            x = layers.Dense(dense_config['units'])(x)
            x = layers.Activation(dense_config['activation'])(x)
            x = layers.Dropout(dense_config['dropout'])(x)
        
        # Output layer
        outputs = layers.Dense(custom_head['output_units'])(x)
        outputs = layers.Activation(custom_head['output_activation'])(outputs)
        
        model = keras.Model(inputs, outputs)
        
        return model, base_model
    
    def create_data_generators(self, train_dir, val_dir, test_dir):
        """Create data generators for training, validation, and testing"""
        print("📊 Creating data generators...")
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=TRAINING_CONFIG['rotation_range'],
            width_shift_range=TRAINING_CONFIG['width_shift_range'],
            height_shift_range=TRAINING_CONFIG['height_shift_range'],
            horizontal_flip=TRAINING_CONFIG['horizontal_flip'],
            vertical_flip=TRAINING_CONFIG['vertical_flip'],
            zoom_range=TRAINING_CONFIG['zoom_range'],
            shear_range=TRAINING_CONFIG['shear_range'],
            brightness_range=TRAINING_CONFIG['brightness_range'],
            fill_mode=TRAINING_CONFIG['fill_mode']
        )
        
        # No augmentation for validation and test
        val_test_datagen = ImageDataGenerator(rescale=1./255)
        
        # Create generators
        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=(self.img_height, self.img_width),
            batch_size=TRAINING_CONFIG['batch_size'],
            class_mode='categorical',
            shuffle=True
        )
        
        val_generator = val_test_datagen.flow_from_directory(
            val_dir,
            target_size=(self.img_height, self.img_width),
            batch_size=TRAINING_CONFIG['batch_size'],
            class_mode='categorical',
            shuffle=False
        )
        
        test_generator = val_test_datagen.flow_from_directory(
            test_dir,
            target_size=(self.img_height, self.img_width),
            batch_size=TRAINING_CONFIG['batch_size'],
            class_mode='categorical',
            shuffle=False
        )
        
        return train_generator, val_generator, test_generator
    
    def compile_model(self, model):
        """Compile the model with optimizer and loss function"""
        print("⚙️  Compiling model...")
        
        model.compile(
            optimizer=optimizers.Adam(learning_rate=TRAINING_CONFIG['learning_rate']),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def setup_callbacks(self):
        """Setup training callbacks"""
        print("📞 Setting up callbacks...")
        
        callbacks_list = [
            # Early stopping
            callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=TRAINING_CONFIG['early_stopping_patience'],
                restore_best_weights=True,
                verbose=1
            ),
            
            # Reduce learning rate on plateau
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=TRAINING_CONFIG['reduce_lr_factor'],
                patience=TRAINING_CONFIG['reduce_lr_patience'],
                min_lr=TRAINING_CONFIG['min_lr'],
                verbose=1
            ),
            
            # Model checkpoint
            callbacks.ModelCheckpoint(
                filepath=MODEL_SAVE_PATH,
                monitor='val_accuracy',
                save_best_only=True,
                save_weights_only=False,
                verbose=1
            ),
            
            # TensorBoard
            callbacks.TensorBoard(
                log_dir=TENSORBOARD_LOG_DIR,
                histogram_freq=1,
                write_graph=True,
                write_images=True
            ),
            
            # CSV logger
            callbacks.CSVLogger(
                filename=LOGS_DIR / 'training_log.csv',
                append=True
            )
        ]
        
        return callbacks_list
    
    def train_model(self, train_generator, val_generator, model_type='cnn'):
        """Train the CNN model"""
        print(f"🚀 Training {model_type.upper()} model...")
        
        # Create model
        if model_type == 'cnn':
            model = self.create_cnn_model()
        elif model_type == 'hybrid':
            model, base_model = self.create_hybrid_cnn_model()
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        # Compile model
        model = self.compile_model(model)
        
        # Setup callbacks
        callbacks_list = self.setup_callbacks()
        
        # Print model summary
        print("\n📋 Model Summary:")
        model.summary()
        
        # Calculate steps
        steps_per_epoch = len(train_generator)
        validation_steps = len(val_generator)
        
        print(f"\n📊 Training Configuration:")
        print(f"  Epochs: {TRAINING_CONFIG['epochs']}")
        print(f"  Batch Size: {TRAINING_CONFIG['batch_size']}")
        print(f"  Steps per Epoch: {steps_per_epoch}")
        print(f"  Validation Steps: {validation_steps}")
        print(f"  Learning Rate: {TRAINING_CONFIG['learning_rate']}")
        
        # Train model
        print("\n🏃 Starting training...")
        history = model.fit(
            train_generator,
            steps_per_epoch=steps_per_epoch,
            epochs=TRAINING_CONFIG['epochs'],
            validation_data=val_generator,
            validation_steps=validation_steps,
            callbacks=callbacks_list,
            verbose=1
        )
        
        self.model = model
        self.history = history
        
        return model, history
    
    def evaluate_model(self, test_generator):
        """Evaluate the trained model"""
        print("📊 Evaluating model...")
        
        if self.model is None:
            raise ValueError("Model not trained yet!")
        
        # Evaluate on test set
        test_loss, test_accuracy = self.model.evaluate(test_generator, verbose=1)
        
        print(f"\n📈 Test Results:")
        print(f"  Test Loss: {test_loss:.4f}")
        print(f"  Test Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
        
        # Get predictions
        predictions = self.model.predict(test_generator)
        predicted_classes = np.argmax(predictions, axis=1)
        true_classes = test_generator.classes
        
        # Classification report
        print("\n📋 Classification Report:")
        report = classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        print(classification_report(true_classes, predicted_classes, target_names=self.class_names))
        
        # Confusion matrix
        cm = confusion_matrix(true_classes, predicted_classes)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.class_names, 
                   yticklabels=self.class_names)
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'confusion_matrix.png')
        plt.show()
        
        return {
            'test_loss': test_loss,
            'test_accuracy': test_accuracy,
            'classification_report': report,
            'confusion_matrix': cm.tolist()
        }
    
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            print("No training history available!")
            return
        
        print("📈 Plotting training history...")
        
        # Extract history
        acc = self.history.history['accuracy']
        val_acc = self.history.history['val_accuracy']
        loss = self.history.history['loss']
        val_loss = self.history.history['val_loss']
        epochs = range(1, len(acc) + 1)
        
        # Create plots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Accuracy plot
        ax1.plot(epochs, acc, 'b-', label='Training Accuracy')
        ax1.plot(epochs, val_acc, 'r-', label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Loss plot
        ax2.plot(epochs, loss, 'b-', label='Training Loss')
        ax2.plot(epochs, val_loss, 'r-', label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'training_history.png')
        plt.show()
    
    def save_model_metadata(self, evaluation_results, model_type='cnn'):
        """Save model metadata and results"""
        print("💾 Saving model metadata...")
        
        metadata = {
            'model_type': model_type,
            'architecture': TRAINING_CONFIG['cnn_architecture'] if model_type == 'cnn' else TRAINING_CONFIG['hybrid_cnn'],
            'training_config': TRAINING_CONFIG,
            'classes': self.class_names,
            'num_classes': self.num_classes,
            'input_shape': [self.img_height, self.img_width, 3],
            'evaluation_results': evaluation_results,
            'training_date': datetime.now().isoformat(),
            'model_path': str(MODEL_SAVE_PATH),
            'tensorboard_logs': str(TENSORBOARD_LOG_DIR)
        }
        
        # Save metadata
        metadata_path = MODELS_DIR / 'model_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Model metadata saved to: {metadata_path}")
        
        return metadata

def main():
    """Main training function"""
    print("🌱 CNN-First Ginger Disease Detection Training")
    print("=" * 60)
    
    # Check if processed data exists
    processed_dir = PROCESSED_DATASET_PATH
    if not processed_dir.exists():
        print("❌ Processed dataset not found!")
        print("Please run data preprocessing first:")
        print("  python data_preprocessing.py")
        return
    
    # Check for train/val/test directories
    train_dir = processed_dir / 'train'
    val_dir = processed_dir / 'validation'
    test_dir = processed_dir / 'test'
    
    if not all([train_dir.exists(), val_dir.exists(), test_dir.exists()]):
        print("❌ Train/validation/test directories not found!")
        print("Please run data preprocessing first:")
        print("  python data_preprocessing.py")
        return
    
    # Initialize model
    model_trainer = CNNGingerDiseaseModel()
    
    # Create data generators
    train_gen, val_gen, test_gen = model_trainer.create_data_generators(
        train_dir, val_dir, test_dir
    )
    
    print(f"\n📊 Dataset Information:")
    print(f"  Training samples: {train_gen.samples}")
    print(f"  Validation samples: {val_gen.samples}")
    print(f"  Test samples: {test_gen.samples}")
    print(f"  Classes: {train_gen.class_indices}")
    
    # Ask user for model type
    print(f"\n🤖 Available Model Types:")
    print("1. CNN (Custom CNN architecture)")
    print("2. Hybrid CNN (CNN + Transfer Learning)")
    print("3. Both (Compare both approaches)")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        # Train CNN model
        model, history = model_trainer.train_model(train_gen, val_gen, 'cnn')
        evaluation_results = model_trainer.evaluate_model(test_gen)
        model_trainer.plot_training_history()
        model_trainer.save_model_metadata(evaluation_results, 'cnn')
        
    elif choice == '2':
        # Train Hybrid model
        model, history = model_trainer.train_model(train_gen, val_gen, 'hybrid')
        evaluation_results = model_trainer.evaluate_model(test_gen)
        model_trainer.plot_training_history()
        model_trainer.save_model_metadata(evaluation_results, 'hybrid')
        
    elif choice == '3':
        # Train both models and compare
        print("\n🔄 Training CNN model...")
        cnn_model, cnn_history = model_trainer.train_model(train_gen, val_gen, 'cnn')
        cnn_results = model_trainer.evaluate_model(test_gen)
        model_trainer.plot_training_history()
        model_trainer.save_model_metadata(cnn_results, 'cnn')
        
        print("\n🔄 Training Hybrid model...")
        hybrid_trainer = CNNGingerDiseaseModel()
        hybrid_model, hybrid_history = hybrid_trainer.train_model(train_gen, val_gen, 'hybrid')
        hybrid_results = hybrid_trainer.evaluate_model(test_gen)
        hybrid_trainer.plot_training_history()
        hybrid_trainer.save_model_metadata(hybrid_results, 'hybrid')
        
        # Compare results
        print(f"\n📊 Model Comparison:")
        print(f"  CNN Accuracy: {cnn_results['test_accuracy']:.4f} ({cnn_results['test_accuracy']*100:.2f}%)")
        print(f"  Hybrid Accuracy: {hybrid_results['test_accuracy']:.4f} ({hybrid_results['test_accuracy']*100:.2f}%)")
        
    else:
        print("❌ Invalid choice!")
        return
    
    print("\n🎉 Training completed successfully!")
    print(f"📁 Model saved to: {MODEL_SAVE_PATH}")
    print(f"📊 Logs saved to: {LOGS_DIR}")
    print(f"📈 TensorBoard logs: {TENSORBOARD_LOG_DIR}")

if __name__ == "__main__":
    main()
