# GingerlyAI System Architecture Diagram

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Mobile Application Layer - Android Optimized"
        UI[Ionic React UI<br/>Touch-Optimized Interface]
        Camera[Camera Module<br/>Image Capture]
        MLEngine[TensorFlow.js<br/>CNN Inference Engine]
        LocalDB[(SQLite Database<br/>Offline Storage)]
        SyncEngine[Sync Service<br/>Background Sync]
    end
    
    subgraph "Backend API Layer - Node.js"
        API[Express REST API<br/>JWT Authentication]
        AuthService[Authentication<br/>Service]
        PredictionService[Prediction<br/>Management]
        RemedyService[Remedy<br/>Database]
        ModelService[ML Model<br/>Versioning]
    end
    
    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL<br/>Production Database)]
        FileStorage[File Storage<br/>Images & Models]
    end
    
    subgraph "ML Training Pipeline - Python"
        DataPrep[Data Preprocessing<br/>Image Augmentation]
        Training[CNN Training<br/>Transfer Learning]
        Evaluation[Model Evaluation<br/>Accuracy Testing]
        Export[TensorFlow.js Export<br/>Model Optimization]
    end
    
    subgraph "Disease Detection Classes"
        Classes[7 Disease Classes:<br/>• Healthy<br/>• Bacterial Wilt<br/>• Rhizome Rot<br/>• Leaf Spot<br/>• Soft Rot<br/>• Yellow Disease<br/>• Root Knot Nematode]
    end
    
    %% Mobile App Connections
    UI --> Camera
    UI --> MLEngine
    UI --> LocalDB
    UI --> SyncEngine
    Camera --> MLEngine
    MLEngine --> LocalDB
    
    %% Offline/Online Flow
    LocalDB -->|Online| SyncEngine
    SyncEngine -->|HTTPS| API
    UI -->|Online| API
    
    %% Backend Connections
    API --> AuthService
    API --> PredictionService
    API --> RemedyService
    API --> ModelService
    AuthService --> PostgreSQL
    PredictionService --> PostgreSQL
    RemedyService --> PostgreSQL
    ModelService --> PostgreSQL
    ModelService --> FileStorage
    PredictionService --> FileStorage
    
    %% ML Pipeline Flow
    DataPrep --> Training
    Training --> Evaluation
    Evaluation --> Export
    Export --> FileStorage
    FileStorage --> ModelService
    ModelService -->|Download| MLEngine
    
    %% Disease Classes
    Training --> Classes
    MLEngine --> Classes
    
    style UI fill:#4CAF50,color:#fff
    style MLEngine fill:#FF9800,color:#fff
    style LocalDB fill:#2196F3,color:#fff
    style API fill:#9C27B0,color:#fff
    style PostgreSQL fill:#2196F3,color:#fff
    style Training fill:#FF5722,color:#fff
    style Classes fill:#607D8B,color:#fff
```

## Detailed Component Architecture

```mermaid
graph LR
    subgraph "Android Mobile Device"
        subgraph "Presentation Layer"
            Login[Login/Register]
            Home[Home Dashboard]
            CameraPage[Camera Capture]
            Results[Results Display]
            History[History View]
            Profile[User Profile]
        end
        
        subgraph "Service Layer"
            AuthSvc[Auth Service<br/>JWT Management]
            MLSvc[ML Service<br/>Local Inference]
            DBSvc[Database Service<br/>SQLite CRUD]
            APISvc[API Service<br/>HTTP Client]
            SyncSvc[Sync Service<br/>Data Sync]
        end
        
        subgraph "Native Layer - Capacitor"
            CameraPlugin[Camera Plugin]
            StoragePlugin[SQLite Plugin]
            NetworkPlugin[Network Plugin]
            GeoPlugin[Geolocation Plugin]
            PrefsPlugin[Secure Storage]
        end
    end
    
    subgraph "Backend Server"
        Routes[API Routes]
        Controllers[Controllers]
        Middleware[Middleware<br/>Auth/Validation]
        Models[ORM Models]
        DB[(Database)]
    end
    
    %% Page to Service connections
    Login --> AuthSvc
    CameraPage --> MLSvc
    CameraPage --> CameraPlugin
    Results --> DBSvc
    History --> SyncSvc
    
    %% Service to Plugin connections
    AuthSvc --> PrefsPlugin
    MLSvc --> StoragePlugin
    DBSvc --> StoragePlugin
    APISvc --> NetworkPlugin
    CameraPage --> GeoPlugin
    
    %% Service to Backend connections
    AuthSvc -->|HTTPS| Routes
    APISvc -->|HTTPS| Routes
    SyncSvc -->|HTTPS| Routes
    
    %% Backend flow
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Models
    Models --> DB
    
    style CameraPage fill:#4CAF50,color:#fff
    style MLSvc fill:#FF9800,color:#fff
    style DBSvc fill:#2196F3,color:#fff
    style Routes fill:#9C27B0,color:#fff
```

## Data Flow Architecture - Offline-First

```mermaid
sequenceDiagram
    participant Farmer as 👨‍🌾 Farmer
    participant Mobile as 📱 Mobile App
    participant Camera as 📷 Camera
    participant ML as 🤖 ML Engine
    participant LocalDB as 💾 SQLite
    participant Sync as 🔄 Sync Service
    participant Backend as ☁️ Backend API
    participant Cloud as 🗄️ Cloud Database
    
    Note over Farmer,Cloud: OFFLINE MODE - No Internet Required
    
    Farmer->>Mobile: Open App
    Mobile->>LocalDB: Load User Data
    LocalDB-->>Mobile: User Profile
    
    Farmer->>Camera: Capture Ginger Leaf
    Camera-->>Mobile: Image URI
    
    Mobile->>ML: Process Image
    Note over ML: CNN Inference<br/>TensorFlow.js<br/>224x224 Input
    ML-->>Mobile: Disease Prediction<br/>+ Confidence Score
    
    Mobile->>LocalDB: Save Prediction<br/>(synced = false)
    Mobile->>LocalDB: Get Remedy Info
    LocalDB-->>Mobile: Treatment Details
    
    Mobile->>Farmer: Show Results<br/>+ Recommendations
    
    Note over Farmer,Cloud: ONLINE MODE - Internet Available
    
    Farmer->>Mobile: Open App Later
    Mobile->>Sync: Check Network
    Sync->>Backend: Sync Offline Predictions
    Backend->>Cloud: Store Data
    Cloud-->>Backend: Success
    Backend-->>Sync: Sync Complete
    Sync->>LocalDB: Mark as Synced
    
    Sync->>Backend: Check Model Updates
    Backend-->>Sync: New Model Available
    Sync->>LocalDB: Download & Store
    
    Mobile->>Farmer: Sync Complete ✓
```

## ML Training to Deployment Pipeline

```mermaid
graph TD
    Start[Raw Ginger Images] --> Collect[Data Collection<br/>7 Disease Classes]
    Collect --> Organize[Organize Dataset<br/>Train/Val/Test Split]
    
    Organize --> Preprocess[Preprocessing<br/>• Resize to 224x224<br/>• Normalization<br/>• Augmentation]
    
    Preprocess --> Select[Select Base Model<br/>EfficientNetB0 or<br/>MobileNetV2]
    
    Select --> Transfer[Transfer Learning<br/>• Load ImageNet Weights<br/>• Freeze Base Layers<br/>• Train Head Only]
    
    Transfer --> FineTune[Fine-Tuning<br/>• Unfreeze Top Layers<br/>• Lower Learning Rate<br/>• Train End-to-End]
    
    FineTune --> Evaluate[Evaluation<br/>• Accuracy Testing<br/>• Confusion Matrix<br/>• Confidence Analysis]
    
    Evaluate --> Decision{Accuracy<br/>>90%?}
    Decision -->|No| Preprocess
    Decision -->|Yes| Optimize[Model Optimization<br/>• Quantization<br/>• Graph Optimization]
    
    Optimize --> ExportTFJS[Export TensorFlow.js<br/>• JSON Model<br/>• Binary Weights<br/>• Metadata]
    
    ExportTFJS --> Upload[Upload to Backend<br/>Model Versioning]
    
    Upload --> Admin[Admin Activates Model<br/>via Dashboard]
    
    Admin --> Mobile[Mobile Devices<br/>Download Update]
    
    Mobile --> Deploy[Deployed on Device<br/>Ready for Offline Use]
    
    style Start fill:#E3F2FD
    style Transfer fill:#FFF3E0
    style Evaluate fill:#F3E5F5
    style Decision fill:#FFEBEE
    style ExportTFJS fill:#E8F5E9
    style Deploy fill:#4CAF50,color:#fff
```

## Network Topology - Deployment Architecture

```mermaid
graph TB
    subgraph "Villaverde, Nueva Vizcaya - Farming Region"
        Farmer1[👨‍🌾 Farmer 1<br/>Android Device]
        Farmer2[👨‍🌾 Farmer 2<br/>Android Device]
        Farmer3[👨‍🌾 Farmer 3<br/>Android Device]
        FarmerN[👨‍🌾 Farmer N<br/>Android Device]
    end
    
    subgraph "Mobile Network / WiFi"
        Network[🌐 Internet<br/>When Available]
    end
    
    subgraph "Cloud Infrastructure"
        LB[Load Balancer<br/>Nginx/CloudFlare]
        
        subgraph "Application Tier"
            API1[API Server 1<br/>Node.js + Express]
            API2[API Server 2<br/>Node.js + Express]
        end
        
        subgraph "Data Tier"
            Primary[(Primary PostgreSQL<br/>Read/Write)]
            Replica1[(Replica 1<br/>Read Only)]
            Replica2[(Replica 2<br/>Read Only)]
        end
        
        Storage[File Storage<br/>Images & ML Models]
        
        Admin[👨‍💼 Admin Dashboard<br/>Web Interface]
    end
    
    subgraph "ML Training Infrastructure"
        Training[Training Server<br/>Python + TensorFlow<br/>GPU-Enabled]
    end
    
    %% Farmer connections (Offline Capable)
    Farmer1 -.->|Sync When Online| Network
    Farmer2 -.->|Sync When Online| Network
    Farmer3 -.->|Sync When Online| Network
    FarmerN -.->|Sync When Online| Network
    
    %% Network to Cloud
    Network --> LB
    
    %% Load Balancer distribution
    LB --> API1
    LB --> API2
    
    %% API to Database
    API1 --> Primary
    API2 --> Primary
    API1 --> Replica1
    API2 --> Replica2
    
    %% Database replication
    Primary -.->|Replication| Replica1
    Primary -.->|Replication| Replica2
    
    %% API to Storage
    API1 --> Storage
    API2 --> Storage
    
    %% Admin access
    Admin --> LB
    
    %% ML Training
    Training --> Storage
    Admin --> Training
    
    style Farmer1 fill:#4CAF50,color:#fff
    style Farmer2 fill:#4CAF50,color:#fff
    style Farmer3 fill:#4CAF50,color:#fff
    style FarmerN fill:#4CAF50,color:#fff
    style Primary fill:#2196F3,color:#fff
    style Training fill:#FF5722,color:#fff
    style Admin fill:#9C27B0,color:#fff
```

## Technology Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APPLICATION LAYER                      │
│                   (Android Optimized - API 21+)                  │
├─────────────────────────────────────────────────────────────────┤
│  Framework:    Ionic React 7.5.5 + Capacitor 5.5.1             │
│  UI Library:   React 18.2.0                                     │
│  Routing:      React Router 5.3.4                              │
│  State:        React Context API                               │
│  ML Engine:    TensorFlow.js 4.12.0 (WebGL/CPU)               │
│  Database:     SQLite (Capacitor Community Plugin)             │
│  Camera:       Capacitor Camera Plugin                         │
│  Storage:      Capacitor Preferences (Secure)                  │
│  Network:      Capacitor Network Plugin                        │
│  Location:     Capacitor Geolocation                           │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS (When Online)
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Runtime:      Node.js 18+                                      │
│  Framework:    Express 4.18.2                                   │
│  Database:     PostgreSQL 12+ (Production)                      │
│                SQLite 5.1.7 (Development)                       │
│  ORM:          Sequelize 6.35.2                                 │
│  Auth:         JWT (jsonwebtoken 9.0.2)                        │
│  Security:     bcrypt, helmet, cors, rate-limit                │
│  Validation:   Joi 17.11.0                                      │
│  File Upload:  Multer 1.4.5                                     │
│  Logging:      Winston 3.11.0                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   ML TRAINING PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│  Language:     Python 3.9+                                      │
│  ML Framework: TensorFlow 2.13.0                               │
│  High-Level:   Keras 2.13.1                                     │
│  Export:       TensorFlowJS 4.12.0                             │
│  Processing:   NumPy, Pandas, OpenCV, Pillow                   │
│  Augment:      Albumentations, imgaug                          │
│  Visualize:    Matplotlib, Seaborn, Plotly                     │
│  Base Models:  EfficientNetB0, MobileNetV2                     │
│  Training:     Transfer Learning + Fine-Tuning                  │
│  Output:       Quantized TensorFlow.js Model (5-15 MB)         │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features & Capabilities

### 🌐 Offline-First Architecture
- **Complete offline functionality**: Disease detection works without internet
- **Local SQLite database**: Stores predictions, remedies, and ML models
- **Smart synchronization**: Background sync when network available
- **Conflict resolution**: Handles offline changes gracefully

### 🤖 CNN-Based Disease Detection
- **7 Disease classes**: Healthy + 6 ginger diseases
- **High accuracy**: >90% classification accuracy
- **Fast inference**: 500-1000ms on mid-range Android devices
- **Optimized models**: Transfer learning with EfficientNetB0/MobileNetV2

### 📱 Mobile-Optimized Performance
- **Android API 21+**: Compatible with devices from 2014 onwards
- **Memory efficient**: 50-100MB during inference
- **Battery conscious**: Optimized CPU/GPU usage
- **Small model size**: 5-15MB (quantized)

### 🔒 Security & Privacy
- **JWT authentication**: Secure token-based auth
- **Role-based access**: User and Admin roles
- **Encrypted storage**: Secure local data storage
- **Password hashing**: bcrypt with salt

### 🔄 Synchronization Strategy
1. User authentication state (highest priority)
2. Critical predictions (high confidence)
3. ML model updates
4. Remedy information updates
5. Historical predictions
6. User profile updates
7. Analytics data

---

## System Requirements

### Mobile Device Requirements (Farmers)
- **OS**: Android 5.0 (API 21) or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB free space
- **Camera**: Any resolution (will be processed to 224x224)
- **Internet**: Optional (only for sync and updates)

### Backend Server Requirements
- **OS**: Linux/Windows Server
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 12+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB+ (for images and models)
- **Network**: Public IP with HTTPS

### ML Training Requirements
- **OS**: Linux/Windows with Python 3.9+
- **GPU**: CUDA-capable GPU (4GB+ VRAM) recommended
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 100GB+ (for dataset and models)
- **Framework**: TensorFlow 2.13.0 with GPU support

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Project**: GingerlyAI - Ginger Disease Detection System  
**Target Region**: Villaverde, Nueva Vizcaya, Philippines

