# GingerlyAI - Ginger Disease Detection App

GingerlyAI is a hybrid offline-first mobile application built with Ionic React that uses deep learning to detect diseases in ginger plants and provide remedy recommendations to farmers.

> **📊 Current Status**: All systems operational! See [PROJECT_STATUS_UPDATE.md](PROJECT_STATUS_UPDATE.md) for detailed status information.

## 🎯 Features

### For Farmers (Users)
- **Offline Disease Detection**: Capture images and run CNN inference locally on device
- **Remedy Recommendations**: Get detailed treatment and prevention advice
- **Prediction History**: View past disease detections with sync capabilities
- **Profile Management**: Manage farming profile and preferences
- **Offline-First**: Works without internet connection, syncs when online

### For System Managers (Admins)
- **User Management**: CRUD operations for farmer accounts
- **Remedy Management**: Manage disease information and treatments
- **Model Versioning**: Upload and manage ML model versions
- **Analytics Dashboard**: View usage statistics and insights

## 🏗️ Architecture

### Frontend (Mobile App)
- **Framework**: Ionic + React (JavaScript)
- **ML Inference**: TensorFlow.js with mobile-optimized platform for offline CNN predictions
- **Local Storage**: SQLite via Capacitor for offline data
- **State Management**: React Context API
- **Authentication**: JWT with secure token storage via Capacitor Preferences

### Backend (API)
- **Framework**: Node.js + Express
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with role-based access control
- **File Storage**: Local filesystem (configurable for S3)
- **API Documentation**: RESTful API with comprehensive endpoints

### ML Pipeline
- **Training**: Python + TensorFlow/Keras
- **Export**: Convert to TensorFlow.js format (optimized for mobile)
- **Deployment**: Admin uploads via backend, mobile apps fetch updates
- **Mobile Optimization**: Uses WebGL/CPU backends for optimal performance

## 📁 Project Structure

```
gingerlyai/
├── backend/                 # Express.js API Server
│   ├── src/
│   │   ├── config/         # Database, JWT configuration
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Sequelize database models
│   │   ├── controllers/    # Business logic controllers
│   │   ├── routes/         # API route definitions
│   │   └── server.js       # Main server file
│   ├── migrations/         # Database migrations
│   └── package.json
│
├── mobile/                 # Ionic React Mobile App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── pages/          # App pages/screens
│   │   ├── services/       # API, DB, ML, Sync services
│   │   └── App.tsx         # Main app component
│   ├── capacitor.config.ts # Capacitor configuration
│   └── package.json
│
└── docs/                   # Documentation
    ├── api-specification.md
    ├── architecture.md
    └── deployment.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ with pip (for ML training)
- Git

### Automated Setup (Recommended)

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/gingerlyai.git
   cd gingerlyai
   ```

2. **Run Setup Script**
   ```bash
   # This creates all necessary .env files and directories
   node setup-development.js
   ```

3. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   # Server runs on http://localhost:3000
   ```

4. **Start Mobile App**
   ```bash
   cd mobile
   npm install
   npm start
   # App runs on http://localhost:8100
   ```

5. **Set up AI Model Training**
   ```bash
   cd ml-training
   pip install tensorflow keras numpy pandas opencv-python Pillow scikit-learn matplotlib seaborn tqdm requests python-dotenv h5py tensorboard
   python setup_ai_model.py
   ```

### Manual Setup (Alternative)

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Mobile Setup**
   ```bash
   cd mobile
   npm install
   cp env.example .env
   # Edit .env with API URL
   npm start
   ```

3. **ML Training Setup**
   ```bash
   cd ml-training
   pip install -r requirements.txt
   python setup_ai_model.py
   ```

### Mobile App Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file in mobile directory
   echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Mobile Development**
   
   **For Android:**
   ```bash
   cd mobile
   npm run android:build
   # Opens Android Studio
   ```
   
   **For iOS** (macOS only):
   ```bash
   cd mobile
   
   # Quick setup (automated)
   chmod +x setup-ios.sh
   ./setup-ios.sh
   
   # Or manual setup
   npm run ios:build
   # Opens Xcode
   ```
   
   📱 **See detailed guides:**
   - iOS: `mobile/IOS_SETUP_GUIDE.md`
   - Android: Standard Capacitor workflow

## 📱 Mobile App Features

### Core Functionality
- **Camera Integration**: Capture or select images from gallery
- **Offline ML Inference**: Run disease detection without internet
- **Smart Sync**: Automatic background synchronization
- **Secure Authentication**: Biometric login support (device permitting)
- **Responsive Design**: Works on phones and tablets

### Technical Features
- **Progressive Web App**: Installable on any device
- **Service Workers**: Background sync and caching
- **Capacitor Plugins**: Native device integration
- **SQLite Database**: Robust offline storage
- **Performance Optimized**: Lazy loading and code splitting

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile

### Disease Detection
- `POST /api/predictions` - Create prediction
- `GET /api/predictions` - Get user predictions
- `POST /api/predictions/sync` - Sync offline predictions

### Remedies
- `GET /api/remedies` - Get remedies
- `GET /api/remedies/sync` - Get updated remedies
- `POST /api/remedies` - Create remedy (Admin)

### Model Management
- `GET /api/models/active` - Get active model
- `GET /api/models/updates` - Check for updates
- `POST /api/models` - Upload model (Admin)

## 🔒 Security Features

- **JWT Authentication** with access/refresh token pattern
- **Role-Based Access Control** (User/Admin)
- **Password Hashing** with bcrypt
- **Input Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Secure Token Storage** using Capacitor Secure Storage

## 🎯 Development Workflow

### Adding New Features

1. **Backend Changes**
   - Add/modify models in `backend/src/models/`
   - Create controllers in `backend/src/controllers/`
   - Define routes in `backend/src/routes/`
   - Add validation schemas in `middleware/validation.js`

2. **Frontend Changes**
   - Create pages in `mobile/src/pages/`
   - Add services in `mobile/src/services/`
   - Update context providers as needed
   - Add route definitions in `App.tsx`

3. **Database Changes**
   - Create migrations using Sequelize CLI
   - Update model definitions
   - Test migrations thoroughly

### Testing

```bash
# Backend tests
cd backend
npm test

# Mobile app tests
cd mobile
npm test
```

## 📦 Deployment

### Backend Deployment
- Configure environment variables for production
- Set up PostgreSQL database
- Deploy to cloud platform (Heroku, AWS, DigitalOcean)
- Configure reverse proxy (Nginx) if needed

### Mobile App Deployment
- Build production version: `npm run build`
- Deploy web version to hosting platform
- Build native apps for App Store/Play Store

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs/`

---

**GingerlyAI** - Empowering farmers with AI-driven plant disease detection 🌱
