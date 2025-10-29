# 🔌 API Connection Guide

Complete guide for connecting the GingerlyAI mobile app to the backend API.

---

## 📋 **Connection Overview**

```
Mobile App (Ionic React)
    ↓
API Service (apiService.js)
    ↓
HTTP/HTTPS Request
    ↓
Backend API (Express.js)
    ↓
Database (SQLite/PostgreSQL)
```

---

## 🔧 **Configuration**

### **Backend API Endpoint**

The backend exposes a REST API at:
```
Development:  http://localhost:3000/api
Staging:      https://staging-api.gingerlyai.com/api
Production:   https://api.gingerlyai.com/api
```

### **Mobile App Configuration**

Configure API endpoint in `mobile/.env`:

```env
# Development
REACT_APP_API_URL=http://localhost:3000/api

# Staging
REACT_APP_API_URL=https://staging-api.gingerlyai.com/api

# Production
REACT_APP_API_URL=https://api.gingerlyai.com/api
```

---

## 📡 **Available API Endpoints**

### **Authentication**

```javascript
// Register new user
POST /api/auth/register
Body: {
  username: "farmer1",
  email: "farmer@example.com",
  password: "SecurePass123!",
  fullName: "John Farmer",
  phone: "+1234567890"
}

// Login
POST /api/auth/login
Body: {
  email: "farmer@example.com",
  password: "SecurePass123!"
}

// Refresh token
POST /api/auth/refresh
Body: {
  refreshToken: "your-refresh-token"
}

// Get profile
GET /api/auth/profile
Headers: {
  Authorization: "Bearer your-access-token"
}

// Update profile
PUT /api/auth/profile
Headers: {
  Authorization: "Bearer your-access-token"
}
Body: {
  fullName: "John Updated Farmer",
  phone: "+9876543210"
}
```

### **Predictions**

```javascript
// Create prediction
POST /api/predictions
Headers: {
  Authorization: "Bearer your-access-token"
}
Body: {
  imageUrl: "https://...",
  prediction: "bacterial_wilt",
  confidence: 0.95,
  location: { latitude: 16.123, longitude: 120.456 }
}

// Get user predictions
GET /api/predictions
Headers: {
  Authorization: "Bearer your-access-token"
}

// Get prediction by ID
GET /api/predictions/:id
Headers: {
  Authorization: "Bearer your-access-token"
}

// Sync offline predictions
POST /api/predictions/sync
Headers: {
  Authorization: "Bearer your-access-token"
}
Body: {
  predictions: [
    { imageUrl: "...", prediction: "...", confidence: 0.9 }
  ]
}
```

### **Remedies**

```javascript
// Get all remedies
GET /api/remedies

// Get remedy by disease
GET /api/remedies/disease/:diseaseName
// Example: GET /api/remedies/disease/bacterial_wilt

// Get remedies for sync
GET /api/remedies/sync
Query params: ?lastSyncDate=2024-01-01T00:00:00Z
```

### **Models**

```javascript
// Get active model
GET /api/models/active

// Check for model updates
GET /api/models/updates
Query params: ?currentVersion=1.0.0

// Download model (Admin)
GET /api/models/download/:id
Headers: {
  Authorization: "Bearer admin-access-token"
}
```

### **Health Check**

```javascript
// Check API status
GET /api/health
// Response: { status: "ok", timestamp: "..." }
```

---

## 🔌 **Using API Service in Mobile App**

### **Basic Usage**

```javascript
import { apiService } from '../services/apiService';

// In your component or service
async function fetchData() {
  try {
    // GET request
    const predictions = await apiService.get('/predictions');
    
    // POST request
    const newPrediction = await apiService.post('/predictions', {
      imageUrl: 'https://...',
      prediction: 'healthy',
      confidence: 0.92
    });
    
    // PUT request
    const updated = await apiService.put('/auth/profile', {
      fullName: 'New Name'
    });
    
    // DELETE request
    await apiService.delete('/predictions/123');
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}
```

### **With Authentication**

```javascript
import { apiService } from '../services/apiService';

// Login and set tokens
async function login(email, password) {
  const response = await apiService.post('/auth/login', {
    email,
    password
  });
  
  // Set tokens for future requests
  apiService.setTokens({
    accessToken: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken
  });
  
  // Store tokens in secure storage
  await SecureStoragePlugin.set({
    key: 'accessToken',
    value: response.tokens.accessToken
  });
  
  return response.user;
}

// Logout
function logout() {
  apiService.clearTokens();
  // Clear from secure storage too
}
```

### **File Upload**

```javascript
// Upload image for prediction
async function uploadImage(file) {
  try {
    const response = await apiService.uploadFile(
      '/predictions/upload',
      file,
      { metadata: 'additional data' }
    );
    return response;
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

---

## 🧪 **Testing API Connection**

### **Method 1: Using curl**

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl http://localhost:3000/api/predictions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Method 2: Using Postman**

1. **Import Collection**:
   - Create new collection "GingerlyAI API"
   - Add environment variables:
     - `baseUrl`: `http://localhost:3000/api`
     - `accessToken`: (will be set after login)

2. **Test Authentication**:
   - POST `{{baseUrl}}/auth/register`
   - POST `{{baseUrl}}/auth/login`
   - Save accessToken from response

3. **Test Protected Routes**:
   - Add header: `Authorization: Bearer {{accessToken}}`
   - GET `{{baseUrl}}/predictions`

### **Method 3: Using the Mobile App**

Create a test screen in your app:

```javascript
// mobile/src/pages/ApiTest.js
import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonText } from '@ionic/react';
import { apiService } from '../services/apiService';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      const health = await apiService.get('/health');
      setResult(JSON.stringify(health, null, 2));
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const testLogin = async () => {
    try {
      const response = await apiService.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      setResult(JSON.stringify(response, null, 2));
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <h1>API Connection Test</h1>
        
        <IonButton onClick={testConnection}>
          Test Health Endpoint
        </IonButton>
        
        <IonButton onClick={testLogin}>
          Test Login
        </IonButton>
        
        {result && (
          <pre style={{ background: '#e8f5e9', padding: '10px' }}>
            {result}
          </pre>
        )}
        
        {error && (
          <IonText color="danger">
            <p>Error: {error}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ApiTest;
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. CORS Error**

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
```javascript
// Backend: Add your mobile app origin to CORS whitelist
// backend/src/server.js
const allowedOrigins = [
  'http://localhost:8100',  // Ionic dev server
  'capacitor://localhost',  // iOS
  'http://localhost',       // Android
];
```

#### **2. Network Request Failed**

**Error**: `TypeError: Network request failed`

**Causes**:
- Backend not running
- Wrong API URL
- No internet connection (and not in offline mode)

**Solution**:
```javascript
// Check API URL
console.log('API URL:', process.env.REACT_APP_API_URL);

// Verify backend is running
curl http://localhost:3000/api/health

// Check mobile app can reach backend
// For Android emulator, use: http://10.0.2.2:3000/api
// For iOS simulator, use: http://localhost:3000/api
```

#### **3. 401 Unauthorized**

**Error**: `Unauthorized - Token expired or invalid`

**Solution**:
```javascript
// Token might be expired, try refreshing
const refreshed = await apiService.refreshAccessToken();

// Or login again
await login(email, password);
```

#### **4. Timeout Error**

**Error**: `Request timeout`

**Solution**:
```javascript
// Increase timeout in API service
const API_TIMEOUT = 60000; // 60 seconds

// Or check slow queries in backend
```

---

## 🔐 **Security Best Practices**

### **1. Token Storage**

```javascript
// Store tokens securely
import { Preferences } from '@capacitor/preferences';

async function storeTokens(tokens) {
  await Preferences.set({
    key: 'accessToken',
    value: tokens.accessToken
  });
  await Preferences.set({
    key: 'refreshToken',
    value: tokens.refreshToken
  });
}

async function getTokens() {
  const accessToken = await Preferences.get({ key: 'accessToken' });
  const refreshToken = await Preferences.get({ key: 'refreshToken' });
  return {
    accessToken: accessToken.value,
    refreshToken: refreshToken.value
  };
}
```

### **2. Request Interceptors**

```javascript
// Add request logging in development
if (process.env.NODE_ENV === 'development') {
  const originalRequest = apiService.request;
  apiService.request = async function(...args) {
    console.log('[API Request]', args[0]);
    const response = await originalRequest.apply(this, args);
    console.log('[API Response]', response);
    return response;
  };
}
```

### **3. Error Handling**

```javascript
// Centralized error handling
async function handleApiError(error) {
  if (error.message.includes('Session expired')) {
    // Redirect to login
    await logout();
    router.push('/login');
  } else if (error.message.includes('Network error')) {
    // Show offline message
    showToast('No internet connection');
  } else {
    // Show generic error
    showToast(error.message);
  }
}
```

---

## 📊 **Performance Optimization**

### **1. Request Caching**

```javascript
// Cache GET requests for 5 minutes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function cachedGet(endpoint) {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await apiService.get(endpoint);
  cache.set(endpoint, { data, timestamp: Date.now() });
  return data;
}
```

### **2. Request Batching**

```javascript
// Batch multiple predictions
async function syncPredictions(predictions) {
  // Send in batches of 10
  const batchSize = 10;
  for (let i = 0; i < predictions.length; i += batchSize) {
    const batch = predictions.slice(i, i + batchSize);
    await apiService.post('/predictions/sync', { predictions: batch });
  }
}
```

### **3. Retry Logic**

```javascript
// Retry failed requests
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Usage
const data = await retryRequest(() => apiService.get('/predictions'));
```

---

## ✅ **Connection Checklist**

Before deployment, verify:

- [ ] API URL configured for environment
- [ ] CORS allows mobile app origin
- [ ] Authentication working
- [ ] Token refresh working
- [ ] File upload working
- [ ] Offline sync working
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Network errors caught
- [ ] HTTPS in production

---

*API Connection Guide for GingerlyAI* 🔌

