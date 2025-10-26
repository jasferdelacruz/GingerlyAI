#!/usr/bin/env node

/**
 * Fix Backend .env Configuration
 */

const fs = require('fs');
const path = require('path');

const backendEnvPath = './backend/.env';

const correctEnvContent = `# Database Configuration (PostgreSQL for production)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gingerlyai_db
DB_USER=postgres
DB_PASSWORD=password

# Use SQLite for development
USE_SQLITE=true
SQLITE_PATH=database.sqlite

# JWT Configuration
JWT_SECRET=gingerlyai-super-secret-jwt-key-2024-development-change-in-production
JWT_REFRESH_SECRET=gingerlyai-super-secret-refresh-key-2024-development-change-in-production
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

try {
  fs.writeFileSync(backendEnvPath, correctEnvContent);
  console.log('✅ Backend .env file updated successfully!');
  console.log('📝 Key changes made:');
  console.log('   - Added USE_SQLITE=true');
  console.log('   - Added SQLITE_PATH=database.sqlite');
  console.log('   - Updated JWT secrets');
} catch (error) {
  console.error('❌ Failed to update .env file:', error.message);
}
