# 🔧 Backend Environment Configuration Guide

Complete guide for configuring environment variables for different deployment environments.

---

## 📋 **Environment Files**

Create these files in the `backend/` directory:

### **1. `.env.development` (Local Development)**

```env
# GingerlyAI Backend - Development Environment

NODE_ENV=development
PORT=3000
HOST=localhost

# JWT (Development - use simple secrets)
JWT_ACCESS_SECRET=dev-access-secret-key-for-development-only
JWT_REFRESH_SECRET=dev-refresh-secret-key-for-development-only
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Allow local development)
CORS_ORIGIN=http://localhost:8100,http://localhost:3000,capacitor://localhost,http://localhost

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ML Model
MODEL_DIR=./models
MODEL_VERSION=1.0.0

# Rate Limiting (Relaxed for development)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging (Verbose for development)
LOG_LEVEL=debug
LOG_FILE=./logs/dev.log
```

### **2. `.env.staging` (Staging/Testing)**

```env
# GingerlyAI Backend - Staging Environment

NODE_ENV=staging
PORT=3000
HOST=0.0.0.0

# Database (PostgreSQL)
DB_HOST=staging-db.your-cloud.com
DB_PORT=5432
DB_NAME=gingerlyai_staging
DB_USER=gingerlyai_staging_user
DB_PASSWORD=your_staging_password

# JWT
JWT_ACCESS_SECRET=staging-access-secret-change-in-production
JWT_REFRESH_SECRET=staging-refresh-secret-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Staging domains)
CORS_ORIGIN=https://staging.gingerlyai.com,capacitor://localhost

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ML Model
MODEL_DIR=./models
MODEL_VERSION=1.0.0

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/staging.log

# Domain
DOMAIN=https://staging-api.gingerlyai.com
```

### **3. `.env.production` (Production)**

```env
# GingerlyAI Backend - Production Environment
# ⚠️ IMPORTANT: Update all secrets and passwords!

NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (PostgreSQL)
DB_HOST=prod-db.your-cloud.com
DB_PORT=5432
DB_NAME=gingerlyai_production
DB_USER=gingerlyai_prod_user
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD

# JWT (⚠️ MUST CHANGE THESE)
JWT_ACCESS_SECRET=CHANGE_THIS_TO_RANDOM_SECURE_STRING_MIN_32_CHARS
JWT_REFRESH_SECRET=CHANGE_THIS_TO_DIFFERENT_RANDOM_SECURE_STRING_MIN_32_CHARS
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Production domains only)
CORS_ORIGIN=https://gingerlyai.com,https://app.gingerlyai.com,capacitor://localhost

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ML Model
MODEL_DIR=./models
MODEL_VERSION=1.0.0

# Rate Limiting (Strict for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging (Production level)
LOG_LEVEL=warn
LOG_FILE=./logs/production.log

# Domain
DOMAIN=https://api.gingerlyai.com

# SSL (if not handled by reverse proxy)
# SSL_CERT=/etc/ssl/certs/gingerlyai.crt
# SSL_KEY=/etc/ssl/private/gingerlyai.key
```

---

## 🔐 **Security Best Practices**

### **JWT Secrets Generation**

```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate different secrets for access and refresh tokens.

### **Password Requirements**
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Different for each environment
- Never commit to git

### **CORS Configuration**
- Development: Allow localhost
- Staging: Only staging domain
- Production: Only production domain(s)

---

## 📁 **File Structure**

```
backend/
├── .env                    # Current environment (git ignored)
├── .env.development        # Development config (git ignored)
├── .env.staging           # Staging config (git ignored)
├── .env.production        # Production config (git ignored)
├── .env.example           # Template (committed to git)
└── src/
    └── config/
        └── environment.js  # Environment loader
```

---

## 🔄 **Switching Environments**

### **Method 1: Copy appropriate file**
```bash
# For development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env
```

### **Method 2: Use NODE_ENV**
```bash
# Development
NODE_ENV=development npm start

# Staging
NODE_ENV=staging npm start

# Production
NODE_ENV=production npm start
```

---

## ✅ **Environment Validation**

Create `backend/src/config/validateEnv.js`:

```javascript
const validateEnvironment = () => {
  const required = [
    'NODE_ENV',
    'PORT',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Validate JWT secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_ACCESS_SECRET.length < 32) {
      console.error('❌ JWT_ACCESS_SECRET must be at least 32 characters');
      process.exit(1);
    }
    if (process.env.JWT_REFRESH_SECRET.length < 32) {
      console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters');
      process.exit(1);
    }
  }

  console.log('✅ Environment variables validated');
};

module.exports = { validateEnvironment };
```

---

## 📊 **Environment Comparison**

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| **Database** | SQLite | PostgreSQL | PostgreSQL |
| **Log Level** | debug | info | warn |
| **Rate Limit** | 1000/15min | 200/15min | 100/15min |
| **CORS** | Permissive | Restricted | Strict |
| **JWT Secrets** | Simple | Complex | Very Complex |

---

## 🚀 **Quick Setup**

```bash
cd backend

# 1. Copy example file
cp .env.example .env

# 2. Edit with your values
nano .env  # or use your editor

# 3. Validate
npm run validate:env  # if you create this script

# 4. Start server
npm start
```

---

## 📝 **Notes**

- ✅ Never commit `.env` files to git
- ✅ Use different secrets for each environment
- ✅ Rotate secrets periodically (every 90 days)
- ✅ Use environment variables on hosting platforms
- ✅ Back up production secrets securely

---

*Backend Environment Configuration Guide* 🔧

