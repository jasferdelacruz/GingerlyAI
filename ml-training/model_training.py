"""
Model training pipeline for Ginger Disease Detection
"""
import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, applications, optimizers, callbacks
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import pandas as pd

from config import *

class GingerDiseaseModel:
    def __init__(self):
        self.model = None
        self.history = None
        self.img_height = TRAINING_CONFIG['img_height']
        self.img_width = TRAINING_CONFIG['img_width']
        self.num_classes = NUM_CLASSES
        self.class_names = DISEASE_CLASSES
        
    def create_base_model(self, model_name='EfficientNetB0'):
        """Create base model with pre-trained weights"""
        print(f"🏗️  Creating base model: {model_name}")
        
        input_shape = (self.img_height, self.img_width, 3)
        
        if model_name == 'EfficientNetB0':
            base_model = applications.EfficientNetB0(
                weights='imagenet',
                include_top=False,
                input_shape=input_shape
            )
        elif model_name == 'MobileNetV2':
            base_model = applications.MobileNetV2(
                weights='imagenet',
                include_top=False,
                input_shape=input_shape
            )
        elif model_name == 'ResNet50':
            base_model = applications.ResNet50(
                weights='imagenet',
                include_top=False,
                input_shape=input_shape
            )
        else:
            raise ValueError(f"Unsupported model: {model_name}")
        
        # Freeze base layers initially
        base_model.trainable = TRAINING_CONFIG['freeze_base_layers']
        
        return base_model
    
    def build_model(self, base_model_name='EfficientNetB0'):
        """Build complete model architecture"""
        print("🔨 Building model architecture...")
        
        base_model = self.create_base_model(base_model_name)
        
        # Add custom classification head
        inputs = keras.Input(shape=(self.img_height, self.img_width, 3))
        
        # Data augmentation layer (for training robustness)
        x = layers.RandomFlip("horizontal")(inputs)
        x = layers.RandomRotation(0.1)(x)
        x = layers.RandomZoom(0.1)(x)
        
        # Preprocessing for pre-trained model
        x = applications.efficientnet.preprocess_input(x)
        
        # Base model
        x = base_model(x, training=False)
        
        # Global pooling and classification head
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(TRAINING_CONFIG['dropout_rate'])(x)
        
        # Dense layers
        x = layers.Dense(
            512, 
            activation='relu',
            kernel_regularizer=keras.regularizers.l2(TRAINING_CONFIG['l2_regularization'])
        )(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(TRAINING_CONFIG['dropout_rate'])(x)
        
        x = layers.Dense(
            256, 
            activation='relu',
            kernel_regularizer=keras.regularizers.l2(TRAINING_CONFIG['l2_regularization'])
        )(x)
        x = layers.Dropout(0.3)(x)
        
        # Output layer
        outputs = layers.Dense(
            self.num_classes, 
            activation='softmax',
            name='predictions'
        )(x)
        
        self.model = keras.Model(inputs, outputs)
        
        # Compile model
        self.model.compile(
            optimizer=optimizers.Adam(
                learning_rate=TRAINING_CONFIG['learning_rate']
            ),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        print("✅ Model built successfully!")
        return self.model
    
    def create_data_generators(self, data_dir):
        """Create data generators for training"""
        print("📊 Creating data generators...")
        
        # Training data generator with augmentation
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
            fill_mode='nearest'
        )
        
        # Validation data generator (no augmentation)
        val_datagen = ImageDataGenerator(rescale=1./255)
        
        # Create generators
        train_generator = train_datagen.flow_from_directory(
            data_dir / 'train',
            target_size=(self.img_height, self.img_width),
            batch_size=TRAINING_CONFIG['batch_size'],
            class_mode='sparse',
            classes=self.class_names,
            shuffle=True
        )
        
        validation_generator = val_datagen.flow_from_directory(
            data_dir / 'validation',
            target_size=(self.img_height, self.img_width),
            batch_size=TRAINING_CONFIG['batch_size'],
            class_mode='sparse',
            classes=self.class_names,
            shuffle=False
        )
        
        return train_generator, validation_generator
    
    def create_callbacks(self):
        """Create training callbacks"""
        print("⚙️  Setting up callbacks...")
        
        # Create timestamp for unique naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        callbacks_list = [
            # Early stopping
            callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=TRAINING_CONFIG['early_stopping_patience'],
                restore_best_weights=True,
                verbose=1
            ),
            
            # Reduce learning rate
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=TRAINING_CONFIG['reduce_lr_factor'],
                patience=TRAINING_CONFIG['reduce_lr_patience'],
                min_lr=TRAINING_CONFIG['min_lr'],
                verbose=1
            ),
            
            # Model checkpointing
            callbacks.ModelCheckpoint(
                filepath=MODELS_DIR / f'best_model_{timestamp}.h5',
                monitor='val_accuracy',
                save_best_only=True,
                save_weights_only=False,
                verbose=1
            ),
            
            # TensorBoard logging
            callbacks.TensorBoard(
                log_dir=TENSORBOARD_LOG_DIR / timestamp,
                histogram_freq=1,
                write_graph=True,
                write_images=True
            ),
            
            # CSV logging
            callbacks.CSVLogger(
                LOGS_DIR / f'training_log_{timestamp}.csv'
            )
        ]
        
        return callbacks_list
    
    def train_model(self, train_generator, validation_generator, class_weights=None):
        """Train the model"""
        print("🚀 Starting model training...")
        
        callbacks_list = self.create_callbacks()
        
        # Calculate steps
        steps_per_epoch = len(train_generator)
        validation_steps = len(validation_generator)
        
        print(f"📈 Training steps per epoch: {steps_per_epoch}")
        print(f"📈 Validation steps: {validation_steps}")
        
        # Train the model
        self.history = self.model.fit(
            train_generator,
            epochs=TRAINING_CONFIG['epochs'],
            validation_data=validation_generator,
            steps_per_epoch=steps_per_epoch,
            validation_steps=validation_steps,
            callbacks=callbacks_list,
            class_weight=class_weights,
            verbose=1
        )
        
        print("✅ Training completed!")
        return self.history
    
    def fine_tune_model(self, train_generator, validation_generator, class_weights=None):
        """Fine-tune the model with unfrozen layers"""
        print("🔧 Starting fine-tuning...")
        
        # Unfreeze the base model
        self.model.layers[4].trainable = True  # Base model is usually layer 4
        
        # Fine-tune from specific layer
        fine_tune_at = TRAINING_CONFIG['fine_tune_from_layer']
        for layer in self.model.layers[4].layers[:fine_tune_at]:
            layer.trainable = False
        
        # Recompile with lower learning rate
        self.model.compile(
            optimizer=optimizers.Adam(learning_rate=TRAINING_CONFIG['learning_rate'] / 10),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        # Create new callbacks for fine-tuning
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        fine_tune_callbacks = [
            callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=5,
                restore_best_weights=True
            ),
            callbacks.ModelCheckpoint(
                filepath=MODELS_DIR / f'fine_tuned_model_{timestamp}.h5',
                monitor='val_accuracy',
                save_best_only=True
            )
        ]
        
        # Fine-tune training
        fine_tune_epochs = 20
        history_fine = self.model.fit(
            train_generator,
            epochs=fine_tune_epochs,
            validation_data=validation_generator,
            callbacks=fine_tune_callbacks,
            class_weight=class_weights,
            verbose=1
        )
        
        return history_fine
    
    def evaluate_model(self, test_generator):
        """Evaluate model performance"""
        print("📊 Evaluating model...")
        
        # Get predictions
        test_generator.reset()
        predictions = self.model.predict(test_generator, verbose=1)
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Get true labels
        true_classes = test_generator.classes
        
        # Classification report
        report = classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        
        print("\n📈 Classification Report:")
        print(classification_report(true_classes, predicted_classes, target_names=self.class_names))
        
        # Confusion matrix
        cm = confusion_matrix(true_classes, predicted_classes)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names
        )
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.xticks(rotation=45)
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        return report, cm
    
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            print("❌ No training history available")
            return
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracy
        ax1.plot(self.history.history['accuracy'], label='Training Accuracy', marker='o')
        ax1.plot(self.history.history['val_accuracy'], label='Validation Accuracy', marker='s')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Plot loss
        ax2.plot(self.history.history['loss'], label='Training Loss', marker='o')
        ax2.plot(self.history.history['val_loss'], label='Validation Loss', marker='s')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def save_model(self, filepath=None):
        """Save the trained model"""
        if filepath is None:
            filepath = MODEL_SAVE_PATH
            
        self.model.save(filepath)
        print(f"💾 Model saved to {filepath}")
        
        # Save model summary
        with open(filepath.parent / 'model_summary.txt', 'w') as f:
            self.model.summary(print_fn=lambda x: f.write(x + '\n'))

def main():
    """Main training pipeline"""
    print("🚀 Starting Ginger Disease Detection Model Training")
    
    # Check if processed data exists
    if not (PROCESSED_DATA_DIR / 'splits').exists():
        print("❌ Processed data not found. Please run data_preprocessing.py first")
        return
    
    # Initialize model
    model_trainer = GingerDiseaseModel()
    
    # Build model
    model = model_trainer.build_model('EfficientNetB0')
    model.summary()
    
    # Load class weights
    try:
        with open(PROCESSED_DATA_DIR / 'class_weights.json', 'r') as f:
            class_weights = json.load(f)
            class_weights = {int(k): v for k, v in class_weights.items()}
    except FileNotFoundError:
        print("⚠️  Class weights not found, using balanced weights")
        class_weights = None
    
    # Create data generators (assuming organized directory structure)
    # You'll need to organize your data into train/validation/test folders
    data_dir = PROCESSED_DATASET_PATH
    train_gen, val_gen = model_trainer.create_data_generators(data_dir)
    
    # Train model
    history = model_trainer.train_model(train_gen, val_gen, class_weights)
    
    # Fine-tune model
    history_fine = model_trainer.fine_tune_model(train_gen, val_gen, class_weights)
    
    # Plot training history
    model_trainer.plot_training_history()
    
    # Save model
    model_trainer.save_model()
    
    print("✅ Training pipeline completed successfully!")
    print(f"📁 Model saved to: {MODEL_SAVE_PATH}")
    print(f"📁 Logs saved to: {LOGS_DIR}")
    print("\n🔄 Next steps:")
    print("1. Run model_export.py to convert to TensorFlow.js")
    print("2. Upload the exported model to your backend API")

if __name__ == "__main__":
    main()
