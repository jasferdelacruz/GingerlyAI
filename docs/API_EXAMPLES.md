# 🚀 GingerlyAI - API Usage Examples

> **Practical examples for integrating with the GingerlyAI API**

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://api.gingerlyai.com/api` (when deployed)

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Disease Predictions](#disease-predictions)
4. [Remedies](#remedies)
5. [ML Models](#ml-models)
6. [Error Handling](#error-handling)
7. [Complete Workflows](#complete-workflows)

---

## 🔐 Authentication

### Register a New User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Dela Cruz",
  "email": "juan.delacruz@gmail.com",
  "password": "SecurePass123!",
  "phone": "+63 912 345 6789",
  "location": "Villaverde, Nueva Vizcaya",
  "farmSize": 2.5
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@gmail.com",
    "phone": "+63 912 345 6789",
    "location": "Villaverde, Nueva Vizcaya",
    "farmSize": 2.5,
    "role": "user",
    "isActive": true,
    "createdAt": "2024-10-29T10:30:00.000Z",
    "updatedAt": "2024-10-29T10:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@gmail.com",
    "password": "SecurePass123!",
    "phone": "+63 912 345 6789",
    "location": "Villaverde, Nueva Vizcaya",
    "farmSize": 2.5
  }'
```

**JavaScript (Fetch API):**
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@gmail.com',
    password: 'SecurePass123!',
    phone: '+63 912 345 6789',
    location: 'Villaverde, Nueva Vizcaya',
    farmSize: 2.5,
  }),
});

const data = await response.json();
console.log('Access Token:', data.tokens.accessToken);

// Store tokens securely
localStorage.setItem('accessToken', data.tokens.accessToken);
localStorage.setItem('refreshToken', data.tokens.refreshToken);
```

---

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan.delacruz@gmail.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@gmail.com",
    "role": "user",
    "lastLoginAt": "2024-10-29T11:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**JavaScript (Axios):**
```javascript
import axios from 'axios';

const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password,
    });

    // Store tokens
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
};

// Usage
await login('juan.delacruz@gmail.com', 'SecurePass123!');
```

---

### Refresh Access Token

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**JavaScript (Auto-refresh on 401):**
```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  
  localStorage.setItem('accessToken', data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.tokens.refreshToken);
  
  return data.tokens.accessToken;
};

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const accessToken = await refreshAccessToken();
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
      
      return axios(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

---

### Logout

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

**JavaScript:**
```javascript
const logout = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
```

---

## 👤 User Management

### Get User Profile

**Request:**
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@gmail.com",
    "phone": "+63 912 345 6789",
    "location": "Villaverde, Nueva Vizcaya",
    "farmSize": 2.5,
    "role": "user",
    "isActive": true,
    "createdAt": "2024-10-29T10:30:00.000Z",
    "lastLoginAt": "2024-10-29T11:00:00.000Z"
  }
}
```

**JavaScript:**
```javascript
const getProfile = async () => {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return await response.json();
};
```

---

### Update Profile

**Request:**
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Juan P. Dela Cruz",
  "phone": "+63 912 345 9999",
  "farmSize": 3.0
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Juan P. Dela Cruz",
    "email": "juan.delacruz@gmail.com",
    "phone": "+63 912 345 9999",
    "location": "Villaverde, Nueva Vizcaya",
    "farmSize": 3.0,
    "role": "user"
  }
}
```

---

### Change Password

**Request:**
```http
PUT /api/auth/password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Note**: After changing password, all refresh tokens are revoked, requiring re-login on all devices.

---

## 🔬 Disease Predictions

### Create Prediction

**Request:**
```http
POST /api/predictions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

image: (binary file)
location: Villaverde, Nueva Vizcaya
notes: Plants showing yellowing leaves
```

**Response (201 Created):**
```json
{
  "message": "Prediction created successfully",
  "prediction": {
    "id": 123,
    "userId": 1,
    "imageUrl": "/uploads/predictions/1730200800000-ginger-plant.jpg",
    "diseaseName": "bacterial_wilt",
    "confidence": 0.94,
    "location": "Villaverde, Nueva Vizcaya",
    "notes": "Plants showing yellowing leaves",
    "isSynced": true,
    "createdAt": "2024-10-29T12:00:00.000Z"
  },
  "remedy": {
    "id": 1,
    "diseaseName": "Bacterial Wilt",
    "diseaseCode": "BACTERIAL_WILT",
    "description": "Bacterial wilt is caused by Ralstonia solanacearum...",
    "symptoms": [
      "Sudden wilting of leaves",
      "Yellowing and drooping of foliage",
      "Brown discoloration of vascular tissue"
    ],
    "treatments": [...],
    "preventionMeasures": [...],
    "severity": "critical"
  }
}
```

**JavaScript (FormData):**
```javascript
const createPrediction = async (imageFile, location, notes) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('location', location);
  formData.append('notes', notes);

  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:3000/api/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return await response.json();
};

// Usage with file input
const fileInput = document.querySelector('#image-input');
const file = fileInput.files[0];

const result = await createPrediction(
  file,
  'Villaverde, Nueva Vizcaya',
  'Plants showing yellowing leaves'
);

console.log('Detected Disease:', result.prediction.diseaseName);
console.log('Confidence:', (result.prediction.confidence * 100).toFixed(2) + '%');
```

**React Native / Capacitor:**
```javascript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
  });

  return image.webPath;
};

const uploadPrediction = async () => {
  const imagePath = await takePicture();
  
  const response = await fetch(imagePath);
  const blob = await response.blob();
  
  const formData = new FormData();
  formData.append('image', blob, 'ginger-plant.jpg');
  formData.append('location', 'Villaverde, Nueva Vizcaya');
  formData.append('notes', 'Captured from mobile');

  const accessToken = localStorage.getItem('accessToken');

  const result = await fetch('http://localhost:3000/api/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return await result.json();
};
```

---

### Get User Predictions

**Request:**
```http
GET /api/predictions?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "id": 123,
      "imageUrl": "/uploads/predictions/1730200800000-ginger-plant.jpg",
      "diseaseName": "bacterial_wilt",
      "confidence": 0.94,
      "location": "Villaverde, Nueva Vizcaya",
      "notes": "Plants showing yellowing leaves",
      "createdAt": "2024-10-29T12:00:00.000Z"
    },
    {
      "id": 122,
      "imageUrl": "/uploads/predictions/1730194400000-healthy-ginger.jpg",
      "diseaseName": "healthy",
      "confidence": 0.98,
      "location": "Farm Plot A",
      "notes": null,
      "createdAt": "2024-10-29T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**JavaScript:**
```javascript
const getPredictions = async (page = 1, limit = 10) => {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(
    `http://localhost:3000/api/predictions?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  return await response.json();
};
```

---

### Sync Offline Predictions

**Request:**
```http
POST /api/predictions/sync
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "predictions": [
    {
      "localId": "offline-001",
      "diseaseName": "leaf_spot",
      "confidence": 0.87,
      "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "location": "Farm Plot B",
      "notes": "Offline prediction",
      "createdAt": "2024-10-29T09:00:00.000Z"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Predictions synced successfully",
  "synced": 1,
  "failed": 0,
  "results": [
    {
      "localId": "offline-001",
      "serverId": 124,
      "status": "success"
    }
  ]
}
```

---

## 💊 Remedies

### Get All Remedies

**Request:**
```http
GET /api/remedies
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "remedies": [
    {
      "id": 1,
      "diseaseName": "Bacterial Wilt",
      "diseaseCode": "BACTERIAL_WILT",
      "description": "Bacterial wilt is caused by Ralstonia solanacearum...",
      "symptoms": [
        "Sudden wilting of leaves",
        "Yellowing and drooping of foliage",
        "Brown discoloration of vascular tissue",
        "Plant death within 7-10 days"
      ],
      "treatments": [
        {
          "name": {
            "en": "Crop Rotation",
            "tl": "Pag-rotate ng Pananim"
          },
          "type": "organic",
          "description": {
            "en": "Rotate ginger crops with non-host crops...",
            "tl": "I-rotate ang luya sa ibang pananim..."
          },
          "application": {
            "en": "Plant non-susceptible crops for 3-4 years",
            "tl": "Magtanim ng hindi madaling tamaan ng sakit sa loob ng 3-4 taon"
          },
          "effectiveness": {
            "en": "High - Prevents disease recurrence",
            "tl": "Mataas - Pinipigilan ang pagbabalik ng sakit"
          },
          "cost": {
            "en": "Moderate",
            "tl": "Katamtaman"
          }
        }
      ],
      "preventionMeasures": [
        "Use disease-free seed rhizomes",
        "Improve drainage to prevent waterlogging",
        "Avoid injury to plants during cultivation"
      ],
      "severity": "critical",
      "isActive": true,
      "version": 1
    }
  ]
}
```

---

### Get Remedy by Disease Code

**Request:**
```http
GET /api/remedies/BACTERIAL_WILT
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "remedy": {
    "id": 1,
    "diseaseName": "Bacterial Wilt",
    "diseaseCode": "BACTERIAL_WILT",
    "description": "Bacterial wilt is caused by Ralstonia solanacearum...",
    "symptoms": [...],
    "treatments": [...],
    "preventionMeasures": [...],
    "severity": "critical"
  }
}
```

---

### Get Remedies for Sync (with version)

**Request:**
```http
GET /api/remedies/sync?lastVersion=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "remedies": [...],
  "latestVersion": 1,
  "hasUpdates": true
}
```

**JavaScript (Offline Sync):**
```javascript
const syncRemedies = async () => {
  const lastVersion = localStorage.getItem('remediesVersion') || 0;
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(
    `http://localhost:3000/api/remedies/sync?lastVersion=${lastVersion}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (data.hasUpdates) {
    // Store in local database (IndexedDB/SQLite)
    await storeRemediesLocally(data.remedies);
    
    // Update version
    localStorage.setItem('remediesVersion', data.latestVersion);
    
    console.log(`Updated ${data.remedies.length} remedies`);
  }

  return data;
};
```

---

## 🤖 ML Models

### Get Active Model

**Request:**
```http
GET /api/models/active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "model": {
    "id": 1,
    "name": "Ginger Disease Classifier v2",
    "version": "2.0.0",
    "description": "EfficientNetB0-based CNN for ginger disease detection",
    "accuracy": 0.94,
    "modelPath": "/models/tfjs_model/model.json",
    "inputShape": [1, 224, 224, 3],
    "outputClasses": [
      "healthy",
      "bacterial_wilt",
      "rhizome_rot",
      "leaf_spot",
      "soft_rot",
      "yellow_disease",
      "root_knot_nematode"
    ],
    "isActive": true,
    "createdAt": "2024-10-20T00:00:00.000Z"
  }
}
```

---

### Check for Model Updates

**Request:**
```http
GET /api/models/updates?currentVersion=1.0.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "hasUpdate": true,
  "latestVersion": "2.0.0",
  "model": {
    "id": 1,
    "name": "Ginger Disease Classifier v2",
    "version": "2.0.0",
    "modelPath": "/models/tfjs_model/model.json",
    "downloadSize": 15728640,
    "releaseNotes": "Improved accuracy on bacterial wilt detection"
  }
}
```

**JavaScript (Download Model):**
```javascript
const checkAndDownloadModel = async () => {
  const currentVersion = localStorage.getItem('modelVersion') || '0.0.0';
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(
    `http://localhost:3000/api/models/updates?currentVersion=${currentVersion}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (data.hasUpdate) {
    console.log(`New model available: ${data.latestVersion}`);
    
    // Download model
    const modelUrl = `http://localhost:3000${data.model.modelPath}`;
    const model = await tf.loadLayersModel(modelUrl);
    
    // Save to IndexedDB
    await model.save('indexeddb://ginger-disease-model');
    
    // Update version
    localStorage.setItem('modelVersion', data.latestVersion);
    
    return model;
  }

  return null;
};
```

---

## ❌ Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid token",
  "message": "Token is invalid or expired"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions",
  "message": "Access denied. Required roles: admin"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**JavaScript Error Handler:**
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        console.error('Invalid input:', error.response.data.details);
        break;
      case 401:
        console.error('Authentication failed');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        console.error('Permission denied');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error('Unknown error:', error.response.data);
    }
  } else if (error.request) {
    // Request made but no response
    console.error('Network error - no response from server');
  } else {
    // Error in request setup
    console.error('Request error:', error.message);
  }
};
```

---

## 🔄 Complete Workflows

### Workflow 1: New User Registration to First Prediction

```javascript
// Step 1: Register
const registerUser = async () => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maria Santos',
      email: 'maria.santos@gmail.com',
      password: 'SecurePass123!',
      phone: '+63 912 345 6789',
      location: 'Villaverde, Nueva Vizcaya',
      farmSize: 1.5,
    }),
  });

  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.tokens.refreshToken);
  
  return data;
};

// Step 2: Get Active Model
const getActiveModel = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/models/active', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  return await response.json();
};

// Step 3: Download and Load Model
const loadModel = async (modelPath) => {
  const modelUrl = `http://localhost:3000${modelPath}`;
  const model = await tf.loadLayersModel(modelUrl);
  await model.save('indexeddb://ginger-disease-model');
  return model;
};

// Step 4: Capture and Predict
const captureAndPredict = async (model) => {
  // Capture image (simulated)
  const imageFile = await captureImage();
  
  // Create prediction on server
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('location', 'Farm Plot A');
  formData.append('notes', 'First prediction');

  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:3000/api/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });

  return await response.json();
};

// Step 5: View Results
const viewResults = (prediction) => {
  console.log('Disease:', prediction.prediction.diseaseName);
  console.log('Confidence:', (prediction.prediction.confidence * 100).toFixed(2) + '%');
  console.log('Remedy:', prediction.remedy.diseaseName);
  console.log('Treatments:', prediction.remedy.treatments);
};

// Complete Workflow
const completeWorkflow = async () => {
  try {
    // 1. Register
    const user = await registerUser();
    console.log('User registered:', user.user.name);

    // 2. Get model info
    const modelInfo = await getActiveModel();
    console.log('Model:', modelInfo.model.name);

    // 3. Load model
    const model = await loadModel(modelInfo.model.modelPath);
    console.log('Model loaded');

    // 4. Make prediction
    const prediction = await captureAndPredict(model);
    
    // 5. View results
    viewResults(prediction);
  } catch (error) {
    handleApiError(error);
  }
};
```

---

### Workflow 2: Offline-First Prediction with Sync

```javascript
import { mlService } from './services/mlService';
import { databaseService } from './services/databaseService';
import { syncService } from './services/syncService';

// Offline prediction workflow
const offlinePredictionWorkflow = async (imageUri) => {
  try {
    // 1. Check if online
    const isOnline = navigator.onLine;

    // 2. Run local ML prediction
    const prediction = await mlService.predict(imageUri);
    
    // 3. Save to local database
    const localPrediction = {
      localId: `offline-${Date.now()}`,
      imageUri,
      diseaseName: prediction.topPrediction,
      confidence: prediction.confidence,
      location: await getCurrentLocation(),
      notes: '',
      isSynced: false,
      createdAt: new Date().toISOString(),
    };

    await databaseService.savePrediction(localPrediction);

    // 4. If online, sync immediately
    if (isOnline) {
      await syncService.syncPredictions();
    }

    // 5. Get remedy from local database
    const remedy = await databaseService.getRemedyByDisease(
      prediction.topPrediction
    );

    return {
      prediction: localPrediction,
      remedy,
      isOffline: !isOnline,
    };
  } catch (error) {
    console.error('Offline prediction failed:', error);
    throw error;
  }
};

// Background sync when online
window.addEventListener('online', async () => {
  console.log('Connection restored - syncing data...');
  await syncService.syncAll();
});
```

---

## 🔐 Security Best Practices

### 1. Store Tokens Securely

**Bad:**
```javascript
// ❌ Don't store in plain localStorage
localStorage.setItem('accessToken', token);
```

**Good:**
```javascript
// ✅ Use Capacitor Secure Storage (mobile)
import { Preferences } from '@capacitor/preferences';

await Preferences.set({
  key: 'accessToken',
  value: token,
});

const { value } = await Preferences.get({ key: 'accessToken' });
```

---

### 2. Add Request Timeout

```javascript
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
```

---

### 3. Validate Responses

```javascript
const safeApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

---

## 📱 Mobile-Specific Examples

### React Native / Ionic React Complete Example

```javascript
import { Camera, CameraResultType } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

class PredictionService {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  async getAccessToken() {
    const { value } = await Preferences.get({ key: 'accessToken' });
    return value;
  }

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    return image.webPath;
  }

  async createPrediction(imageUri, location, notes) {
    // Check network status
    const status = await Network.getStatus();

    if (!status.connected) {
      // Handle offline
      return await this.createOfflinePrediction(imageUri, location, notes);
    }

    // Online prediction
    const blob = await (await fetch(imageUri)).blob();
    
    const formData = new FormData();
    formData.append('image', blob, 'prediction.jpg');
    formData.append('location', location);
    formData.append('notes', notes);

    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    return await response.json();
  }

  async createOfflinePrediction(imageUri, location, notes) {
    // Run local ML prediction
    const prediction = await mlService.predict(imageUri);
    
    // Save to local database
    const localPrediction = {
      localId: `offline-${Date.now()}`,
      imageUri,
      diseaseName: prediction.topPrediction,
      confidence: prediction.confidence,
      location,
      notes,
      isSynced: false,
      createdAt: new Date().toISOString(),
    };

    await databaseService.savePrediction(localPrediction);

    // Get remedy from local database
    const remedy = await databaseService.getRemedyByDisease(
      prediction.topPrediction
    );

    return {
      prediction: localPrediction,
      remedy,
      isOffline: true,
    };
  }
}

// Usage in React component
const PredictionScreen = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const predictionService = new PredictionService();

  const handleCapture = async () => {
    try {
      setLoading(true);
      
      const imageUri = await predictionService.captureImage();
      const result = await predictionService.createPrediction(
        imageUri,
        'Villaverde, Nueva Vizcaya',
        'Captured from mobile'
      );

      setResult(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <IonButton onClick={handleCapture} disabled={loading}>
          {loading ? 'Processing...' : 'Capture & Detect'}
        </IonButton>
        
        {result && (
          <div>
            <h2>Disease: {result.prediction.diseaseName}</h2>
            <p>Confidence: {(result.prediction.confidence * 100).toFixed(2)}%</p>
            <h3>Recommended Treatment:</h3>
            <p>{result.remedy.description}</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};
```

---

## 📚 Additional Resources

- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **Architecture**: `/docs/ARCHITECTURE.md`
- **Security**: `/docs/SECURITY.md`
- **Deployment**: `/docs/DEPLOYMENT.md`

---

## 🆘 Support

If you encounter any issues with the API:

1. Check the error response for details
2. Verify your authentication token is valid
3. Ensure request format matches examples
4. Check API server logs for more information
5. Create an issue on GitHub with:
   - Request details
   - Response received
   - Expected behavior

---

**API Version**: 1.0.0  
**Last Updated**: October 29, 2024  
**Documentation**: GingerlyAI API Team

