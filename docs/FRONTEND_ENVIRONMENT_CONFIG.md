# 📱 Frontend Environment Configuration Guide

Complete guide for configuring environment variables for the GingerlyAI mobile app in different environments.

---

## 📋 **Environment Files**

Create these files in the `mobile/` directory:

### **1. `.env.development` (Local Development)**

```env
# GingerlyAI Mobile - Development Environment

# API Configuration
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_API_TIMEOUT=30000

# Environment
REACT_APP_ENV=development
REACT_APP_DEBUG_MODE=true

# App Configuration
REACT_APP_NAME=GingerlyAI (Dev)
REACT_APP_VERSION=1.0.0

# Features (Enable all for development)
REACT_APP_OFFLINE_MODE=true
REACT_APP_ML_INFERENCE=true
REACT_APP_CAMERA_ENABLED=true
REACT_APP_GEOLOCATION_ENABLED=true

# ML Model Configuration
REACT_APP_MODEL_URL=/assets/tfjs_model
REACT_APP_MODEL_VERSION=1.0.0

# Logging
REACT_APP_LOG_LEVEL=debug
REACT_APP_ENABLE_CONSOLE_LOGS=true

# Analytics (Disabled for development)
REACT_APP_ANALYTICS_ENABLED=false
```

### **2. `.env.staging` (Staging/Testing)**

```env
# GingerlyAI Mobile - Staging Environment

# API Configuration
REACT_APP_API_URL=https://staging-api.gingerlyai.com/api
REACT_APP_API_TIMEOUT=30000

# Environment
REACT_APP_ENV=staging
REACT_APP_DEBUG_MODE=true

# App Configuration
REACT_APP_NAME=GingerlyAI (Staging)
REACT_APP_VERSION=1.0.0

# Features
REACT_APP_OFFLINE_MODE=true
REACT_APP_ML_INFERENCE=true
REACT_APP_CAMERA_ENABLED=true
REACT_APP_GEOLOCATION_ENABLED=true

# ML Model Configuration
REACT_APP_MODEL_URL=/assets/tfjs_model
REACT_APP_MODEL_VERSION=1.0.0

# Logging
REACT_APP_LOG_LEVEL=info
REACT_APP_ENABLE_CONSOLE_LOGS=true

# Analytics (Optional for staging)
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_ANALYTICS_ID=UA-STAGING-ID
```

### **3. `.env.production` (Production)**

```env
# GingerlyAI Mobile - Production Environment

# API Configuration
REACT_APP_API_URL=https://api.gingerlyai.com/api
REACT_APP_API_TIMEOUT=30000

# Environment
REACT_APP_ENV=production
REACT_APP_DEBUG_MODE=false

# App Configuration
REACT_APP_NAME=GingerlyAI
REACT_APP_VERSION=1.0.0

# Features
REACT_APP_OFFLINE_MODE=true
REACT_APP_ML_INFERENCE=true
REACT_APP_CAMERA_ENABLED=true
REACT_APP_GEOLOCATION_ENABLED=true

# ML Model Configuration
REACT_APP_MODEL_URL=/assets/tfjs_model
REACT_APP_MODEL_VERSION=1.0.0

# Logging (Minimal for production)
REACT_APP_LOG_LEVEL=error
REACT_APP_ENABLE_CONSOLE_LOGS=false

# Analytics (Enabled for production)
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_ANALYTICS_ID=UA-PRODUCTION-ID

# Performance Monitoring
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 🔧 **Using Environment Variables**

### **In React Components**

```javascript
// Access environment variables
const apiUrl = process.env.REACT_APP_API_URL;
const isDebugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
const appVersion = process.env.REACT_APP_VERSION;

// Example usage
console.log('API URL:', apiUrl);
console.log('Debug Mode:', isDebugMode);
```

### **In API Service**

```javascript
// mobile/src/services/apiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }
  // ... rest of the service
}
```

### **In ML Service**

```javascript
// mobile/src/services/mlService.js
const MODEL_URL = process.env.REACT_APP_MODEL_URL || '/assets/tfjs_model';
const MODEL_VERSION = process.env.REACT_APP_MODEL_VERSION || '1.0.0';

class MLService {
  async loadModel() {
    const modelPath = `${MODEL_URL}/model.json`;
    this.model = await tf.loadLayersModel(modelPath);
  }
}
```

---

## 🔄 **Switching Environments**

### **Method 1: Use env-cmd (Recommended)**

```bash
# Install env-cmd
npm install --save-dev env-cmd

# Update package.json scripts
{
  "scripts": {
    "start": "env-cmd -f .env.development react-scripts start",
    "start:staging": "env-cmd -f .env.staging react-scripts start",
    "start:prod": "env-cmd -f .env.production react-scripts start",
    "build": "env-cmd -f .env.production react-scripts build",
    "build:staging": "env-cmd -f .env.staging react-scripts build",
    "build:dev": "env-cmd -f .env.development react-scripts build"
  }
}
```

### **Method 2: Copy appropriate file**

```bash
# For development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env

# Then run
npm start
```

### **Method 3: Use cross-env**

```bash
# Install cross-env
npm install --save-dev cross-env

# Use in package.json
{
  "scripts": {
    "start:dev": "cross-env REACT_APP_ENV=development react-scripts start",
    "start:staging": "cross-env REACT_APP_ENV=staging react-scripts start",
    "start:prod": "cross-env REACT_APP_ENV=production react-scripts start"
  }
}
```

---

## 📁 **File Structure**

```
mobile/
├── .env                    # Current environment (git ignored)
├── .env.development        # Development config (git ignored)
├── .env.staging           # Staging config (git ignored)
├── .env.production        # Production config (git ignored)
├── .env.example           # Template (committed to git)
├── .env.local             # Local overrides (git ignored)
└── src/
    ├── config/
    │   └── environment.js  # Environment helper
    └── services/
        ├── apiService.js   # Uses REACT_APP_API_URL
        └── mlService.js    # Uses REACT_APP_MODEL_URL
```

---

## 🛠️ **Environment Helper**

Create `mobile/src/config/environment.js`:

```javascript
// Environment configuration helper
export const config = {
  // Environment
  env: process.env.REACT_APP_ENV || 'development',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
  isStaging: process.env.REACT_APP_ENV === 'staging',
  isProduction: process.env.REACT_APP_ENV === 'production',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',

  // API
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  apiTimeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,

  // App
  appName: process.env.REACT_APP_NAME || 'GingerlyAI',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',

  // Features
  offlineMode: process.env.REACT_APP_OFFLINE_MODE === 'true',
  mlInference: process.env.REACT_APP_ML_INFERENCE === 'true',
  cameraEnabled: process.env.REACT_APP_CAMERA_ENABLED === 'true',
  geolocationEnabled: process.env.REACT_APP_GEOLOCATION_ENABLED === 'true',

  // ML Model
  modelUrl: process.env.REACT_APP_MODEL_URL || '/assets/tfjs_model',
  modelVersion: process.env.REACT_APP_MODEL_VERSION || '1.0.0',

  // Logging
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  enableConsoleLogs: process.env.REACT_APP_ENABLE_CONSOLE_LOGS === 'true',

  // Analytics
  analyticsEnabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  analyticsId: process.env.REACT_APP_ANALYTICS_ID,

  // Sentry
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
};

// Validate required variables
export const validateConfig = () => {
  const required = ['REACT_APP_API_URL', 'REACT_APP_ENV'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    return false;
  }

  console.log('✅ Environment configuration validated');
  console.log(`   Environment: ${config.env}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Debug Mode: ${config.debugMode}`);
  
  return true;
};

export default config;
```

### **Usage in App**

```javascript
// mobile/src/App.js
import { config, validateConfig } from './config/environment';

function App() {
  useEffect(() => {
    // Validate configuration on app start
    if (!validateConfig()) {
      console.error('Invalid configuration');
    }

    // Log environment info (only in development)
    if (config.isDevelopment) {
      console.log('Running in development mode');
      console.log('API:', config.apiUrl);
    }
  }, []);

  return (
    <IonApp>
      {/* Your app content */}
    </IonApp>
  );
}
```

---

## 📊 **Environment Comparison**

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| **API URL** | localhost:3000 | staging.com | production.com |
| **Debug Mode** | true | true | false |
| **Console Logs** | true | true | false |
| **Analytics** | false | true | true |
| **Log Level** | debug | info | error |

---

## 🚀 **Build Commands**

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build

# Start development server
npm start

# Start with staging config
npm run start:staging
```

---

## 📱 **Capacitor Environment**

For native builds, environment variables are baked in during build time:

```bash
# Build for iOS (production)
npm run build  # Uses .env.production
npx cap sync ios
npx cap open ios

# Build for Android (staging)
npm run build:staging  # Uses .env.staging
npx cap sync android
npx cap open android
```

---

## ⚠️ **Important Notes**

1. **Prefix Required**: All variables must start with `REACT_APP_`
2. **Build Time**: Variables are embedded at build time, not runtime
3. **Restart Required**: Changes require restart of dev server
4. **Git Ignore**: Never commit `.env` files to git
5. **No Secrets**: Don't put sensitive keys in frontend env files

---

## 🔒 **Security Best Practices**

### **DO:**
- ✅ Use environment variables for API URLs
- ✅ Use different configs for each environment
- ✅ Validate configuration on app start
- ✅ Disable debug mode in production
- ✅ Use HTTPS for production API

### **DON'T:**
- ❌ Don't put API keys in frontend env variables
- ❌ Don't commit `.env` files to git
- ❌ Don't expose backend secrets
- ❌ Don't use same config for all environments

---

## 🧪 **Testing Environments**

```javascript
// mobile/src/config/environment.test.js
import { config, validateConfig } from './environment';

describe('Environment Configuration', () => {
  it('should have valid API URL', () => {
    expect(config.apiUrl).toBeDefined();
    expect(config.apiUrl).toContain('http');
  });

  it('should validate configuration', () => {
    expect(validateConfig()).toBe(true);
  });

  it('should have correct environment', () => {
    expect(['development', 'staging', 'production']).toContain(config.env);
  });
});
```

---

## 📝 **Quick Setup**

```bash
cd mobile

# 1. Create .env file
cp .env.example .env

# 2. Edit with your values
nano .env

# 3. Install env-cmd
npm install --save-dev env-cmd

# 4. Update package.json scripts (see above)

# 5. Start development server
npm start
```

---

*Frontend Environment Configuration Guide* 📱

