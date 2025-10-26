# GingerlyAI - System Architecture Figure
## For Documentation and Presentation

---

## Figure 1: Overall System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                    GINGERLYAI SYSTEM ARCHITECTURE                     ║
║              Offline-First Ginger Disease Detection System           ║
╚══════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────┐
│                     MOBILE APPLICATION LAYER                          │
│                   (Android-Optimized for Farmers)                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Camera    │  │  CNN/ML     │  │   SQLite     │  │   Sync    │ │
│  │  Capture    │→→│  Inference  │→→│   Database   │←←│  Service  │ │
│  │  (Native)   │  │ TensorFlow  │  │  (Offline)   │  │ (Online)  │ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └───────────┘ │
│         ↓              ↓                   ↓                ↑        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         Ionic React User Interface (Touch-Optimized)        │   │
│  │  • Disease Detection  • History  • Remedies  • Profile      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                        ┌───────┴───────┐
                        │  HTTPS/REST   │
                        │  (When Online) │
                        └───────┬───────┘
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                         BACKEND API LAYER                             │
│                      (Node.js + Express Server)                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │     Auth     │  │  Prediction  │  │   Remedy     │  │  Model   │ │
│  │   Service    │  │   Service    │  │   Service    │  │ Service  │ │
│  │  (JWT/Role)  │  │  (CRUD Ops)  │  │  (Database)  │  │ (Version)│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │                  │                │       │
│         └─────────────────┼──────────────────┼────────────────┘       │
│                           │                  │                        │
│  ┌────────────────────────▼──────────────────▼─────────────────────┐ │
│  │              Sequelize ORM + PostgreSQL Database               │ │
│  │  • Users  • Predictions  • Remedies  • Models  • Auth Tokens  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 │ Model Updates
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                      ML TRAINING PIPELINE                              │
│                    (Python + TensorFlow)                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────┐ │
│  │    Ginger    │ → │    CNN       │ → │  Evaluation  │ → │ Export │ │
│  │   Dataset    │   │  Training    │   │   Testing    │   │  TFJS  │ │
│  │ (7 Classes)  │   │  (Transfer)  │   │  (>90% Acc)  │   │ Model  │ │
│  └──────────────┘   └──────────────┘   └──────────────┘   └────────┘ │
│                                                                         │
│  Disease Classes: Healthy, Bacterial Wilt, Rhizome Rot, Leaf Spot,    │
│                   Soft Rot, Yellow Disease, Root Knot Nematode         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


KEY FEATURES:
✓ Works Offline - No internet required for disease detection
✓ CNN-Powered - Advanced deep learning for accurate diagnosis
✓ Android-Optimized - Runs on mid-range smartphones (Android 5.0+)
✓ Real-time Results - 500-1000ms inference time
✓ Smart Sync - Automatic data synchronization when online
✓ Secure - JWT authentication with role-based access control
```

---

## Figure 2: Disease Detection Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│               GINGER DISEASE DETECTION WORKFLOW                      │
└─────────────────────────────────────────────────────────────────────┘

      FARMER INTERACTION              MOBILE PROCESSING
    
    ┌──────────────┐              ┌──────────────────────┐
    │   Open App   │              │  Load User Profile   │
    │  GingerlyAI  │─────────────→│   from SQLite DB     │
    └──────┬───────┘              └──────────────────────┘
           │
           ▼
    ┌──────────────┐              ┌──────────────────────┐
    │   Capture    │              │   Access Native      │
    │Ginger Leaf   │─────────────→│   Camera Module      │
    │    Photo     │              │  (Capacitor Plugin)  │
    └──────┬───────┘              └──────────┬───────────┘
           │                                  │
           │                                  ▼
           │                      ┌───────────────────────┐
           │                      │  Preprocess Image     │
           │                      │  • Resize to 224x224  │
           │                      │  • Normalize pixels   │
           │                      │  • Create tensor      │
           │                      └───────────┬───────────┘
           │                                  │
           │                                  ▼
           │                      ┌───────────────────────┐
           │                      │   CNN INFERENCE       │
           │                      │  (TensorFlow.js)      │
           │                      │  ┌─────────────────┐  │
           │                      │  │  EfficientNetB0 │  │
           │                      │  │   or MobileNet  │  │
           │                      │  └─────────────────┘  │
           │                      │  500-1000ms Process   │
           │                      └───────────┬───────────┘
           │                                  │
           │                                  ▼
           │                      ┌───────────────────────┐
           │                      │  Get Prediction       │
           │                      │  • Disease Name       │
           │                      │  • Confidence Score   │
           │                      │  • Top 3 Results      │
           │                      └───────────┬───────────┘
           │                                  │
           │                                  ▼
           │                      ┌───────────────────────┐
           │                      │  Fetch Remedy Info    │
           │                      │  from Local Database  │
           │                      │  • Symptoms           │
           │                      │  • Treatments         │
           │                      │  • Prevention         │
           │                      └───────────┬───────────┘
           │                                  │
           │                                  ▼
           │                      ┌───────────────────────┐
           │                      │  Save Prediction      │
           │                      │  to Local SQLite      │
           │                      │  (synced = false)     │
           │                      └───────────┬───────────┘
           │                                  │
           ▼                                  ▼
    ┌──────────────┐              ┌──────────────────────┐
    │ View Results │◀─────────────│   Display Results    │
    │  • Disease   │              │  • Disease Name      │
    │  • Remedy    │              │  • Confidence: 95%   │
    │  • Treatment │              │  • Full Details      │
    └──────┬───────┘              └──────────────────────┘
           │
           │   [Later, when online]
           │
           ▼                                  
    ┌──────────────┐              ┌──────────────────────┐
    │ Background   │              │   Sync Service       │
    │    Sync      │─────────────→│  Detects Network     │
    └──────────────┘              └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │  Upload to Backend   │
                                  │  • Save to Cloud DB  │
                                  │  • Mark as synced    │
                                  │  • Check updates     │
                                  └──────────────────────┘

TOTAL TIME: ~1-2 seconds (offline detection)
ACCURACY: >90% for all 7 disease classes
```

---

## Figure 3: Offline-First Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              OFFLINE-FIRST ARCHITECTURE DATA FLOW                    │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════╗
║     OFFLINE MODE (Primary)    ║
║     No Internet Required      ║
╚═══════════════════════════════╝

  📱 Mobile Device
  ┌─────────────────────────────┐
  │   Ionic React Frontend      │
  │  ┌──────────────────────┐   │
  │  │  Camera Capture      │   │
  │  └──────────┬───────────┘   │
  │             ▼               │
  │  ┌──────────────────────┐   │
  │  │ TensorFlow.js CNN    │   │
  │  │ • Load local model   │   │
  │  │ • Run inference      │   │
  │  │ • 224x224 input      │   │
  │  └──────────┬───────────┘   │
  │             ▼               │
  │  ┌──────────────────────┐   │
  │  │  SQLite Database     │   │
  │  │ ┌──────────────────┐ │   │
  │  │ │ • Predictions    │ │   │
  │  │ │ • Remedies       │ │   │
  │  │ │ • ML Models      │ │   │
  │  │ │ • User Data      │ │   │
  │  │ └──────────────────┘ │   │
  │  └──────────┬───────────┘   │
  │             ▼               │
  │  ┌──────────────────────┐   │
  │  │   Display Results    │   │
  │  │  to Farmer (Offline) │   │
  │  └──────────────────────┘   │
  └─────────────────────────────┘

         ║
         ║  When Internet
         ║  Available
         ▼

╔═══════════════════════════════╗
║      ONLINE MODE (Sync)       ║
║    Background Sync Only       ║
╚═══════════════════════════════╝

  📱 Mobile Device
  ┌─────────────────────────────┐
  │   Sync Service Active       │
  │  ┌──────────────────────┐   │
  │  │ Network Detector     │   │
  │  │ (Capacitor Plugin)   │   │
  │  └──────────┬───────────┘   │
  │             ▼               │
  │  ┌──────────────────────┐   │
  │  │ Read Unsynced Data   │   │
  │  │ from SQLite          │   │
  │  └──────────┬───────────┘   │
  └─────────────┼───────────────┘
                │
                │ HTTPS/REST
                ▼
  ☁️  Backend Server
  ┌─────────────────────────────┐
  │   Express API               │
  │  ┌──────────────────────┐   │
  │  │ Authenticate (JWT)   │   │
  │  └──────────┬───────────┘   │
  │             ▼               │
  │  ┌──────────────────────┐   │
  │  │ Save to PostgreSQL   │   │
  │  │ • Predictions        │   │
  │  │ • Images             │   │
  │  │ • Metadata           │   │
  │  └──────────┬───────────┘   │
  │             ▼               │
  │  ┌──────────────────────┐   │
  │  │ Check for Updates    │   │
  │  │ • New remedies       │   │
  │  │ • Model updates      │   │
  │  └──────────┬───────────┘   │
  └─────────────┼───────────────┘
                │
                │ Response
                ▼
  📱 Mobile Device
  ┌─────────────────────────────┐
  │  ┌──────────────────────┐   │
  │  │ Update Local SQLite  │   │
  │  │ • Mark as synced     │   │
  │  │ • Store updates      │   │
  │  └──────────────────────┘   │
  └─────────────────────────────┘

KEY ADVANTAGES:
✓ Works in areas with NO internet (rural farms)
✓ Fast response - no network latency
✓ Data saved locally - never lost
✓ Automatic sync when connection available
✓ Farmer can continue working offline
```

---

## Figure 4: Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GINGERLYAI TECHNOLOGY STACK                       │
└─────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════╗
║                  LAYER 1: MOBILE APPLICATION                         ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  📱 PLATFORM: Android (API 21+) - iOS (13.0+) - PWA                 ║
║                                                                      ║
║  🎨 UI FRAMEWORK                                                    ║
║     ├─ Ionic React 7.5.5 (Cross-platform UI)                       ║
║     ├─ React 18.2.0 (Component library)                            ║
║     └─ React Router 5.3.4 (Navigation)                             ║
║                                                                      ║
║  🔌 NATIVE INTEGRATION (Capacitor 5.5.1)                           ║
║     ├─ Camera Plugin (Image capture)                               ║
║     ├─ SQLite Plugin (Offline database)                            ║
║     ├─ Network Plugin (Connectivity detection)                      ║
║     ├─ Geolocation Plugin (GPS tagging)                            ║
║     └─ Preferences Plugin (Secure storage)                          ║
║                                                                      ║
║  🤖 MACHINE LEARNING                                                ║
║     ├─ TensorFlow.js 4.12.0 (ML inference)                         ║
║     ├─ WebGL Backend (GPU acceleration)                            ║
║     ├─ CPU Fallback (Compatibility)                                ║
║     └─ Model Size: 5-15 MB (quantized)                             ║
║                                                                      ║
║  💾 LOCAL STORAGE                                                   ║
║     ├─ SQLite Database (Offline data)                              ║
║     ├─ IndexedDB (Web fallback)                                    ║
║     └─ Secure Preferences (Tokens)                                 ║
║                                                                      ║
╚═════════════════════════════════════════════════════════════════════╝
                                  │
                                  │ HTTPS/REST API
                                  │ (When Online)
                                  ▼
╔═════════════════════════════════════════════════════════════════════╗
║                    LAYER 2: BACKEND API                             ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ⚙️  RUNTIME: Node.js 18+                                           ║
║                                                                      ║
║  🌐 WEB FRAMEWORK                                                   ║
║     ├─ Express 4.18.2 (REST API)                                   ║
║     ├─ Helmet (Security headers)                                   ║
║     ├─ CORS (Cross-origin)                                         ║
║     └─ Rate Limiter (API protection)                               ║
║                                                                      ║
║  🔐 AUTHENTICATION & SECURITY                                       ║
║     ├─ JWT (jsonwebtoken 9.0.2)                                    ║
║     ├─ bcrypt (Password hashing)                                   ║
║     ├─ Joi (Input validation)                                      ║
║     └─ Role-based access control                                   ║
║                                                                      ║
║  📊 DATABASE                                                        ║
║     ├─ PostgreSQL 12+ (Production)                                 ║
║     ├─ SQLite (Development)                                        ║
║     ├─ Sequelize 6.35.2 (ORM)                                      ║
║     └─ Connection pooling                                          ║
║                                                                      ║
║  📁 FILE HANDLING                                                   ║
║     ├─ Multer (File uploads)                                       ║
║     ├─ Local filesystem (Images)                                   ║
║     └─ Model storage (TFJS files)                                  ║
║                                                                      ║
║  📝 LOGGING                                                         ║
║     └─ Winston 3.11.0 (Application logs)                           ║
║                                                                      ║
╚═════════════════════════════════════════════════════════════════════╝
                                  │
                                  │ Model Updates
                                  │
                                  ▼
╔═════════════════════════════════════════════════════════════════════╗
║                  LAYER 3: ML TRAINING PIPELINE                      ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  🐍 LANGUAGE: Python 3.9+                                           ║
║                                                                      ║
║  🧠 DEEP LEARNING FRAMEWORK                                         ║
║     ├─ TensorFlow 2.13.0 (Training)                                ║
║     ├─ Keras 2.13.1 (High-level API)                              ║
║     └─ TensorFlowJS 4.12.0 (Export)                               ║
║                                                                      ║
║  📊 DATA PROCESSING                                                 ║
║     ├─ NumPy 1.24.3 (Numerical)                                    ║
║     ├─ Pandas 2.0.3 (Data manipulation)                            ║
║     ├─ OpenCV 4.8.0 (Image processing)                             ║
║     └─ Pillow 10.0.0 (Image library)                               ║
║                                                                      ║
║  🔄 DATA AUGMENTATION                                               ║
║     ├─ Albumentations 1.3.1                                        ║
║     └─ imgaug 0.4.0                                                ║
║                                                                      ║
║  📈 VISUALIZATION                                                   ║
║     ├─ Matplotlib 3.7.2                                            ║
║     ├─ Seaborn 0.12.2                                              ║
║     └─ Plotly 5.15.0                                               ║
║                                                                      ║
║  🎯 CNN ARCHITECTURE                                                ║
║     ├─ Base: EfficientNetB0 or MobileNetV2                         ║
║     ├─ Transfer Learning (ImageNet)                                ║
║     ├─ Custom Classification Head                                  ║
║     └─ Output: 7 Disease Classes                                   ║
║                                                                      ║
║  💾 MODEL EXPORT                                                    ║
║     ├─ Format: TensorFlow.js                                       ║
║     ├─ Quantization: 16-bit weights                                ║
║     ├─ Optimization: Graph optimization                            ║
║     └─ Size: 5-15 MB (mobile-optimized)                            ║
║                                                                      ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## System Requirements Summary

### 👨‍🌾 For Farmers (Mobile App Users)
- **Device**: Android 5.0+ smartphone (mid-range)
- **Storage**: 500 MB free space
- **Camera**: Any resolution (processed to 224×224)
- **Internet**: Optional (only for data sync)
- **RAM**: 2GB minimum, 4GB recommended

### 💻 For Backend Server
- **OS**: Linux/Windows Server
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 12+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB+ for images and models
- **Network**: Public IP with HTTPS/SSL

### 🔬 For ML Training
- **OS**: Linux/Windows with Python 3.9+
- **GPU**: CUDA-capable (4GB+ VRAM) recommended
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 100GB+ for dataset and models

---

## Target Deployment

📍 **Location**: Villaverde, Nueva Vizcaya, Philippines  
👥 **Users**: Ginger farmers in rural farming communities  
🌐 **Network**: Limited internet connectivity (offline-first design)  
📱 **Devices**: Common mid-range Android smartphones  
🎯 **Purpose**: Accessible, reliable ginger disease detection

---

**Document**: System Architecture Figure  
**Project**: GingerlyAI  
**Version**: 1.0  
**Date**: October 26, 2025

