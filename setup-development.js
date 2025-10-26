#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * This script sets up the development environment for GingerlyAI
 */

const fs = require('fs');
const path = require('path');

// Backend .env configuration
const backendEnvContent = `# Database Configuration (SQLite for development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gingerlyai_db
DB_USER=postgres
DB_PASSWORD=password

# Use SQLite for development
USE_SQLITE=true
SQLITE_PATH=database.sqlite

# JWT Configuration
JWT_SECRET=gingerlyai-super-secret-jwt-key-2024-development
JWT_REFRESH_SECRET=gingerlyai-super-secret-refresh-key-2024-development
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# File Storage Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg

# Model Storage Configuration
MODEL_STORAGE_PATH=models/
MODEL_BASE_URL=http://localhost:3000/api/models

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:8100
`;

// Mobile .env configuration
const mobileEnvContent = `# API Configuration
REACT_APP_API_URL=http://localhost:3000/api

# App Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
`;

// Production mobile .env configuration
const mobileEnvProdContent = `# Production API Configuration
REACT_APP_API_URL=https://your-production-api.com/api

# App Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
`;

function createEnvFile(filePath, content, description) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created ${description}: ${filePath}`);
    } else {
      console.log(`ℹ️ ${description} already exists: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to create ${description}:`, error.message);
  }
}

function createDirectory(dirPath, description) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created ${description}: ${dirPath}`);
    } else {
      console.log(`ℹ️ ${description} already exists: ${dirPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to create ${description}:`, error.message);
  }
}

console.log('🚀 Setting up GingerlyAI development environment...\n');

// Create backend directories
createDirectory('./backend/uploads', 'Backend uploads directory');
createDirectory('./backend/models', 'Backend models directory');
createDirectory('./backend/logs', 'Backend logs directory');

// Create mobile directories if needed
createDirectory('./mobile/public', 'Mobile public directory');

// Create environment files
createEnvFile('./backend/.env', backendEnvContent, 'Backend environment file');
createEnvFile('./mobile/.env', mobileEnvContent, 'Mobile development environment file');
createEnvFile('./mobile/.env.production', mobileEnvProdContent, 'Mobile production environment file');

console.log('\n🎯 Next Steps:');
console.log('1. Install backend dependencies: cd backend && npm install');
console.log('2. Install mobile dependencies: cd mobile && npm install');
console.log('3. Start backend server: cd backend && npm run dev');
console.log('4. Start mobile app: cd mobile && npm start');
console.log('\n🔧 Configuration Notes:');
console.log('- Backend runs on http://localhost:3000');
console.log('- Mobile app runs on http://localhost:8100');
console.log('- SQLite database is used for development');
console.log('- JWT secrets are set for development (change for production)');
console.log('\n✨ Development environment setup complete!');

