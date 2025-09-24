"""
Model evaluation and testing pipeline for Ginger Disease Detection
"""
import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import pandas as pd
from PIL import Image
import cv2
from tqdm import tqdm

from config import *

class ModelEvaluator:
    def __init__(self):
        self.model = None
        self.class_names = DISEASE_CLASSES
        
    def load_model(self, model_path=None):
        """Load the trained model"""
        if model_path is None:
            model_path = MODEL_SAVE_PATH
            
        print(f"📥 Loading model from {model_path}")
        self.model = keras.models.load_model(model_path)
        print("✅ Model loaded successfully!")
        return self.model
    
    def create_test_generator(self, test_data_dir):
        """Create test data generator"""
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        
        test_datagen = ImageDataGenerator(rescale=1./255)
        
        test_generator = test_datagen.flow_from_directory(
            test_data_dir,
            target_size=(TRAINING_CONFIG['img_height'], TRAINING_CONFIG['img_width']),
            batch_size=TRAINING_CONFIG['batch_size'],
            class_mode='sparse',
            classes=self.class_names,
            shuffle=False
        )
        
        return test_generator
    
    def comprehensive_evaluation(self, test_generator):
        """Perform comprehensive model evaluation"""
        print("📊 Starting comprehensive evaluation...")
        
        # Reset generator
        test_generator.reset()
        
        # Get predictions
        print("🔄 Generating predictions...")
        predictions = self.model.predict(test_generator, verbose=1)
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Get true labels
        true_classes = test_generator.classes
        
        # Basic metrics
        print("\n📈 Classification Report:")
        report = classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        
        print(classification_report(true_classes, predicted_classes, target_names=self.class_names))
        
        # Detailed analysis
        self.plot_confusion_matrix(true_classes, predicted_classes)
        self.plot_class_wise_performance(report)
        self.analyze_confidence_distribution(predictions, true_classes)
        self.analyze_misclassifications(test_generator, predictions, true_classes, predicted_classes)
        
        # Save detailed results
        self.save_evaluation_results(report, true_classes, predicted_classes, predictions)
        
        return report
    
    def plot_confusion_matrix(self, true_classes, predicted_classes):
        """Plot detailed confusion matrix"""
        print("📊 Creating confusion matrix...")
        
        cm = confusion_matrix(true_classes, predicted_classes)
        
        # Normalize confusion matrix
        cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(20, 8))
        
        # Raw counts
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names,
            ax=ax1
        )
        ax1.set_title('Confusion Matrix (Counts)')
        ax1.set_ylabel('True Label')
        ax1.set_xlabel('Predicted Label')
        
        # Normalized percentages
        sns.heatmap(
            cm_normalized, 
            annot=True, 
            fmt='.2f', 
            cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names,
            ax=ax2
        )
        ax2.set_title('Confusion Matrix (Normalized)')
        ax2.set_ylabel('True Label')
        ax2.set_xlabel('Predicted Label')
        
        plt.xticks(rotation=45)
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'detailed_confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def plot_class_wise_performance(self, report):
        """Plot class-wise performance metrics"""
        print("📊 Creating class-wise performance plots...")
        
        # Extract metrics for each class
        classes = [cls for cls in report.keys() if cls not in ['accuracy', 'macro avg', 'weighted avg']]
        
        precision = [report[cls]['precision'] for cls in classes]
        recall = [report[cls]['recall'] for cls in classes]
        f1_score = [report[cls]['f1-score'] for cls in classes]
        support = [report[cls]['support'] for cls in classes]
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
        
        # Precision
        bars1 = ax1.bar(classes, precision, color='skyblue', alpha=0.7)
        ax1.set_title('Precision by Class')
        ax1.set_ylabel('Precision')
        ax1.set_ylim(0, 1)
        ax1.tick_params(axis='x', rotation=45)
        for bar, val in zip(bars1, precision):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{val:.3f}', ha='center', va='bottom')
        
        # Recall
        bars2 = ax2.bar(classes, recall, color='lightgreen', alpha=0.7)
        ax2.set_title('Recall by Class')
        ax2.set_ylabel('Recall')
        ax2.set_ylim(0, 1)
        ax2.tick_params(axis='x', rotation=45)
        for bar, val in zip(bars2, recall):
            ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{val:.3f}', ha='center', va='bottom')
        
        # F1-Score
        bars3 = ax3.bar(classes, f1_score, color='salmon', alpha=0.7)
        ax3.set_title('F1-Score by Class')
        ax3.set_ylabel('F1-Score')
        ax3.set_ylim(0, 1)
        ax3.tick_params(axis='x', rotation=45)
        for bar, val in zip(bars3, f1_score):
            ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{val:.3f}', ha='center', va='bottom')
        
        # Support (number of samples)
        bars4 = ax4.bar(classes, support, color='gold', alpha=0.7)
        ax4.set_title('Support (Number of Samples)')
        ax4.set_ylabel('Number of Samples')
        ax4.tick_params(axis='x', rotation=45)
        for bar, val in zip(bars4, support):
            ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                    f'{val}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'class_wise_performance.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def analyze_confidence_distribution(self, predictions, true_classes):
        """Analyze prediction confidence distribution"""
        print("📊 Analyzing confidence distribution...")
        
        max_confidences = np.max(predictions, axis=1)
        correct_predictions = (np.argmax(predictions, axis=1) == true_classes)
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Overall confidence distribution
        ax1.hist(max_confidences, bins=50, alpha=0.7, color='blue', edgecolor='black')
        ax1.axvline(np.mean(max_confidences), color='red', linestyle='--', 
                   label=f'Mean: {np.mean(max_confidences):.3f}')
        ax1.set_title('Distribution of Maximum Confidence Scores')
        ax1.set_xlabel('Confidence Score')
        ax1.set_ylabel('Frequency')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Confidence for correct vs incorrect predictions
        correct_confidences = max_confidences[correct_predictions]
        incorrect_confidences = max_confidences[~correct_predictions]
        
        ax2.hist(correct_confidences, bins=30, alpha=0.7, color='green', 
                label=f'Correct ({len(correct_confidences)})', density=True)
        ax2.hist(incorrect_confidences, bins=30, alpha=0.7, color='red', 
                label=f'Incorrect ({len(incorrect_confidences)})', density=True)
        ax2.set_title('Confidence Distribution: Correct vs Incorrect')
        ax2.set_xlabel('Confidence Score')
        ax2.set_ylabel('Density')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'confidence_distribution.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Print confidence statistics
        print(f"\n📊 Confidence Statistics:")
        print(f"Overall mean confidence: {np.mean(max_confidences):.3f}")
        print(f"Correct predictions mean confidence: {np.mean(correct_confidences):.3f}")
        print(f"Incorrect predictions mean confidence: {np.mean(incorrect_confidences):.3f}")
        print(f"Accuracy: {np.mean(correct_predictions):.3f}")
    
    def analyze_misclassifications(self, test_generator, predictions, true_classes, predicted_classes):
        """Analyze misclassified samples"""
        print("🔍 Analyzing misclassifications...")
        
        # Find misclassified samples
        misclassified_indices = np.where(predicted_classes != true_classes)[0]
        
        if len(misclassified_indices) == 0:
            print("🎉 No misclassifications found!")
            return
        
        print(f"Found {len(misclassified_indices)} misclassified samples")
        
        # Analyze misclassification patterns
        misclass_patterns = {}
        for idx in misclassified_indices:
            true_class = self.class_names[true_classes[idx]]
            pred_class = self.class_names[predicted_classes[idx]]
            pattern = f"{true_class} -> {pred_class}"
            
            if pattern not in misclass_patterns:
                misclass_patterns[pattern] = []
            misclass_patterns[pattern].append(idx)
        
        # Sort by frequency
        sorted_patterns = sorted(misclass_patterns.items(), key=lambda x: len(x[1]), reverse=True)
        
        print("\n🔍 Most common misclassification patterns:")
        for pattern, indices in sorted_patterns[:10]:
            confidence_scores = [predictions[idx].max() for idx in indices]
            avg_confidence = np.mean(confidence_scores)
            print(f"   {pattern}: {len(indices)} cases (avg confidence: {avg_confidence:.3f})")
        
        # Create misclassification analysis plot
        self.plot_misclassification_analysis(sorted_patterns, predictions)
    
    def plot_misclassification_analysis(self, sorted_patterns, predictions):
        """Plot misclassification analysis"""
        top_patterns = sorted_patterns[:8]  # Top 8 patterns
        
        if not top_patterns:
            return
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # Frequency of misclassification patterns
        patterns = [pattern for pattern, _ in top_patterns]
        counts = [len(indices) for _, indices in top_patterns]
        
        bars = ax1.barh(patterns, counts, color='salmon', alpha=0.7)
        ax1.set_title('Most Common Misclassification Patterns')
        ax1.set_xlabel('Number of Cases')
        
        # Add count labels
        for bar, count in zip(bars, counts):
            ax1.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, 
                    str(count), va='center')
        
        # Confidence distribution for misclassifications
        all_misclass_confidences = []
        pattern_labels = []
        
        for pattern, indices in top_patterns:
            confidences = [predictions[idx].max() for idx in indices]
            all_misclass_confidences.extend(confidences)
            pattern_labels.extend([pattern] * len(confidences))
        
        # Create boxplot
        unique_patterns = [pattern for pattern, _ in top_patterns]
        confidence_data = [
            [predictions[idx].max() for idx in indices] 
            for _, indices in top_patterns
        ]
        
        ax2.boxplot(confidence_data, labels=unique_patterns)
        ax2.set_title('Confidence Distribution by Misclassification Pattern')
        ax2.set_ylabel('Confidence Score')
        ax2.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig(LOGS_DIR / 'misclassification_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def save_evaluation_results(self, report, true_classes, predicted_classes, predictions):
        """Save detailed evaluation results"""
        print("💾 Saving evaluation results...")
        
        # Create detailed results dictionary
        results = {
            'model_info': {
                'num_classes': len(self.class_names),
                'class_names': self.class_names,
                'total_test_samples': len(true_classes)
            },
            'overall_metrics': {
                'accuracy': report['accuracy'],
                'macro_avg': report['macro avg'],
                'weighted_avg': report['weighted avg']
            },
            'class_wise_metrics': {
                cls: report[cls] for cls in self.class_names if cls in report
            },
            'confusion_matrix': confusion_matrix(true_classes, predicted_classes).tolist(),
            'confidence_stats': {
                'mean_confidence': float(np.mean(np.max(predictions, axis=1))),
                'std_confidence': float(np.std(np.max(predictions, axis=1))),
                'min_confidence': float(np.min(np.max(predictions, axis=1))),
                'max_confidence': float(np.max(np.max(predictions, axis=1)))
            }
        }
        
        # Save as JSON
        results_path = LOGS_DIR / 'evaluation_results.json'
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Save as CSV for easier analysis
        df_results = pd.DataFrame([
            {
                'Class': cls,
                'Precision': report[cls]['precision'] if cls in report else None,
                'Recall': report[cls]['recall'] if cls in report else None,
                'F1-Score': report[cls]['f1-score'] if cls in report else None,
                'Support': report[cls]['support'] if cls in report else None
            }
            for cls in self.class_names
        ])
        
        df_results.to_csv(LOGS_DIR / 'class_wise_results.csv', index=False)
        
        print(f"📄 Results saved to {results_path}")
        print(f"📊 CSV results saved to {LOGS_DIR / 'class_wise_results.csv'}")
    
    def benchmark_inference_speed(self, num_samples=100):
        """Benchmark model inference speed"""
        print(f"⏱️  Benchmarking inference speed with {num_samples} samples...")
        
        # Create random test data
        dummy_input = np.random.random((
            num_samples, 
            TRAINING_CONFIG['img_height'], 
            TRAINING_CONFIG['img_width'], 
            3
        )).astype(np.float32)
        
        # Warm up
        _ = self.model.predict(dummy_input[:5], verbose=0)
        
        # Benchmark
        import time
        start_time = time.time()
        predictions = self.model.predict(dummy_input, verbose=0)
        end_time = time.time()
        
        total_time = end_time - start_time
        avg_time_per_sample = total_time / num_samples
        
        print(f"📊 Inference Benchmark Results:")
        print(f"   Total time: {total_time:.3f} seconds")
        print(f"   Average time per sample: {avg_time_per_sample*1000:.1f} ms")
        print(f"   Throughput: {num_samples/total_time:.1f} samples/second")
        
        return avg_time_per_sample

def main():
    """Main evaluation pipeline"""
    print("🚀 Starting Model Evaluation Pipeline")
    
    evaluator = ModelEvaluator()
    
    # Load model
    model = evaluator.load_model()
    if model is None:
        print("❌ Cannot proceed without a trained model")
        return
    
    # Check if test data exists
    test_data_dir = PROCESSED_DATASET_PATH / 'test'
    if not test_data_dir.exists():
        print(f"❌ Test data not found at {test_data_dir}")
        print("📝 Please ensure you have a 'test' folder in your processed dataset")
        return
    
    # Create test generator
    test_generator = evaluator.create_test_generator(test_data_dir)
    
    # Comprehensive evaluation
    report = evaluator.comprehensive_evaluation(test_generator)
    
    # Benchmark inference speed
    evaluator.benchmark_inference_speed()
    
    print("\n✅ Model evaluation completed successfully!")
    print(f"📁 Results saved to: {LOGS_DIR}")
    print(f"📊 Overall Accuracy: {report['accuracy']:.3f}")
    print(f"📊 Macro F1-Score: {report['macro avg']['f1-score']:.3f}")
    
    # Recommendations based on performance
    accuracy = report['accuracy']
    if accuracy >= 0.95:
        print("🎉 Excellent model performance! Ready for production.")
    elif accuracy >= 0.90:
        print("✅ Good model performance. Consider minor optimizations.")
    elif accuracy >= 0.80:
        print("⚠️  Moderate performance. Consider data augmentation or model tuning.")
    else:
        print("❌ Poor performance. Model needs significant improvement.")

if __name__ == "__main__":
    main()
