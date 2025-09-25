# 🚀 GingerlyAI API Documentation

## 📋 Overview

The GingerlyAI Backend API provides RESTful endpoints for user authentication, disease prediction management, remedy information, and ML model management. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3000/api` (development)
**Version**: 1.0.0

---

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication with access and refresh tokens.

### **Headers**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### **Token Refresh**
Access tokens expire in 15 minutes. Use the refresh token to get a new access token.

---

## 📚 API Endpoints

### **Health Check**

#### GET `/health`
Check API server status.

**Response:**
```json
{
  "status": "OK",
  "message": "GingerlyAI Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 🔑 Authentication Endpoints

### **User Registration**

#### POST `/auth/register`
Register a new user account.

**Rate Limit**: 10 requests per 15 minutes

**Request Body:**
```json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "location": "California, USA",
  "farmSize": 25.5
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "location": "California, USA",
    "farmSize": "25.50",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### **User Login**

#### POST `/auth/login`
Authenticate user and get tokens.

**Rate Limit**: 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-string",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### **Refresh Token**

#### POST `/auth/refresh`
Get new access token using refresh token.

**Rate Limit**: 10 requests per 15 minutes

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

### **Get Profile**

#### GET `/auth/profile`
Get current user profile.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "location": "California, USA",
    "farmSize": "25.50",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Update Profile**

#### PUT `/auth/profile`
Update user profile information.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "John Updated Farmer",
  "phone": "+0987654321",
  "location": "Texas, USA",
  "farmSize": 30.0
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-string",
    "name": "John Updated Farmer",
    "email": "john@example.com",
    "phone": "+0987654321",
    "location": "Texas, USA",
    "farmSize": "30.00",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Change Password**

#### PUT `/auth/change-password`
Change user password.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### **Logout**

#### POST `/auth/logout`
Logout and invalidate current refresh token.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### **Logout All Devices**

#### POST `/auth/logout-all`
Logout from all devices and invalidate all refresh tokens.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "message": "Logged out from all devices successfully"
}
```

---

## 🔬 Prediction Endpoints

### **Create Prediction**

#### POST `/predictions`
Create a new disease prediction.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "remedyId": "uuid-string",
  "modelId": "uuid-string",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "predictionResults": {
    "predictions": [
      {"disease": "bacterial_wilt", "confidence": 0.85},
      {"disease": "healthy", "confidence": 0.10},
      {"disease": "leaf_spot", "confidence": 0.05}
    ],
    "processingTime": 150
  },
  "topPrediction": "bacterial_wilt",
  "confidence": 0.85,
  "isOfflinePrediction": true,
  "deviceInfo": {
    "platform": "iOS",
    "version": "15.0",
    "model": "iPhone 13"
  },
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 10
  },
  "notes": "Leaves showing brown spots"
}
```

**Response (201):**
```json
{
  "message": "Prediction created successfully",
  "prediction": {
    "id": "uuid-string",
    "userId": "uuid-string",
    "remedyId": "uuid-string",
    "modelId": "uuid-string",
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "predictionResults": {...},
    "topPrediction": "bacterial_wilt",
    "confidence": 0.85,
    "isOfflinePrediction": true,
    "synced": true,
    "syncedAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "remedy": {
      "id": "uuid-string",
      "diseaseName": "Bacterial Wilt",
      "diseaseCode": "bacterial_wilt",
      "description": "A bacterial disease affecting ginger plants...",
      "treatments": ["Treatment 1", "Treatment 2"]
    },
    "model": {
      "id": "uuid-string",
      "name": "GingerNet v1.0",
      "version": "1.0.0",
      "accuracy": 0.92
    }
  }
}
```

### **Get User Predictions**

#### GET `/predictions`
Get predictions for the authenticated user.

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `sort` (string): Sort field (default: "createdAt")
- `order` (string): Sort order "ASC" or "DESC" (default: "DESC")
- `topPrediction` (string): Filter by disease type
- `minConfidence` (number): Minimum confidence score (0-1)
- `maxConfidence` (number): Maximum confidence score (0-1)
- `startDate` (string): Filter from date (ISO string)
- `endDate` (string): Filter to date (ISO string)

**Example**: `/predictions?page=1&limit=5&topPrediction=bacterial_wilt&minConfidence=0.8`

**Response (200):**
```json
{
  "predictions": [
    {
      "id": "uuid-string",
      "topPrediction": "bacterial_wilt",
      "confidence": 0.85,
      "isOfflinePrediction": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "remedy": {
        "diseaseName": "Bacterial Wilt",
        "severity": "high"
      },
      "model": {
        "name": "GingerNet v1.0",
        "version": "1.0.0"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 5,
    "totalPages": 5
  }
}
```

### **Get Prediction by ID**

#### GET `/predictions/:id`
Get specific prediction details.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "prediction": {
    "id": "uuid-string",
    "userId": "uuid-string",
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "predictionResults": {
      "predictions": [
        {"disease": "bacterial_wilt", "confidence": 0.85},
        {"disease": "healthy", "confidence": 0.10}
      ],
      "processingTime": 150
    },
    "topPrediction": "bacterial_wilt",
    "confidence": 0.85,
    "notes": "Leaves showing brown spots",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "remedy": {
      "diseaseName": "Bacterial Wilt",
      "description": "A bacterial disease...",
      "symptoms": ["Brown spots", "Wilting leaves"],
      "treatments": ["Apply fungicide", "Remove affected plants"],
      "preventionMeasures": ["Proper drainage", "Crop rotation"]
    },
    "model": {
      "name": "GingerNet v1.0",
      "version": "1.0.0",
      "accuracy": 0.92
    },
    "user": {
      "id": "uuid-string",
      "name": "John Farmer",
      "email": "john@example.com"
    }
  }
}
```

### **Sync Offline Predictions**

#### POST `/predictions/sync`
Sync multiple offline predictions to the server.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "predictions": [
    {
      "id": "client-uuid-1",
      "modelId": "uuid-string",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "predictionResults": {...},
      "topPrediction": "bacterial_wilt",
      "confidence": 0.85,
      "isOfflinePrediction": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "client-uuid-2",
      "modelId": "uuid-string",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "predictionResults": {...},
      "topPrediction": "healthy",
      "confidence": 0.92,
      "isOfflinePrediction": true,
      "createdAt": "2024-01-01T01:00:00.000Z"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Sync completed",
  "results": [
    {
      "clientId": "client-uuid-1",
      "serverId": "server-uuid-1",
      "status": "success",
      "message": "Synced successfully"
    },
    {
      "clientId": "client-uuid-2",
      "serverId": "server-uuid-2",
      "status": "success",
      "message": "Synced successfully"
    }
  ],
  "syncTime": "2024-01-01T02:00:00.000Z"
}
```

### **Get Prediction Statistics**

#### GET `/predictions/stats`
Get prediction statistics for the user.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "stats": {
    "total": 150,
    "recent": 25,
    "averageConfidence": "0.8234",
    "topDiseases": [
      {
        "disease": "bacterial_wilt",
        "count": 45,
        "avgConfidence": "0.8567"
      },
      {
        "disease": "healthy",
        "count": 60,
        "avgConfidence": "0.9123"
      },
      {
        "disease": "leaf_spot",
        "count": 30,
        "avgConfidence": "0.7890"
      }
    ]
  }
}
```

### **Delete Prediction**

#### DELETE `/predictions/:id`
Delete a specific prediction.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "message": "Prediction deleted successfully"
}
```

---

## 💊 Remedy Endpoints

### **Get All Remedies**

#### GET `/remedies`
Get all available disease remedies.

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in disease name or description
- `severity` (string): Filter by severity level

**Response (200):**
```json
{
  "remedies": [
    {
      "id": "uuid-string",
      "diseaseName": "Bacterial Wilt",
      "diseaseCode": "bacterial_wilt",
      "description": "A serious bacterial disease that affects ginger plants...",
      "symptoms": [
        "Yellowing and wilting of leaves",
        "Brown discoloration of stems",
        "Plant death"
      ],
      "causes": [
        "Bacterial infection",
        "Poor drainage",
        "High humidity"
      ],
      "treatments": [
        "Remove infected plants immediately",
        "Apply bactericide spray",
        "Improve soil drainage"
      ],
      "preventionMeasures": [
        "Use disease-free planting material",
        "Ensure proper field sanitation",
        "Avoid waterlogged conditions"
      ],
      "severity": "high",
      "imageUrl": "https://example.com/images/bacterial_wilt.jpg",
      "version": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 7,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### **Get Remedy by ID**

#### GET `/remedies/:id`
Get specific remedy details.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "remedy": {
    "id": "uuid-string",
    "diseaseName": "Bacterial Wilt",
    "diseaseCode": "bacterial_wilt",
    "description": "A serious bacterial disease that affects ginger plants causing significant yield losses if not managed properly.",
    "symptoms": [
      "Yellowing and wilting of leaves starting from lower leaves",
      "Brown discoloration of stems and rhizomes",
      "Soft rot of underground parts",
      "Stunted growth and eventual plant death"
    ],
    "causes": [
      "Ralstonia solanacearum bacterial infection",
      "Poor field drainage and waterlogged conditions",
      "High soil temperature and humidity",
      "Contaminated farm tools and equipment"
    ],
    "treatments": [
      "Remove and destroy infected plants immediately",
      "Apply copper-based bactericide spray",
      "Improve soil drainage system",
      "Use bio-control agents like Trichoderma",
      "Apply organic amendments to improve soil health"
    ],
    "preventionMeasures": [
      "Use certified disease-free planting material",
      "Implement crop rotation with non-host crops",
      "Maintain proper field sanitation",
      "Avoid waterlogged conditions",
      "Disinfect farm tools regularly"
    ],
    "severity": "high",
    "imageUrl": "https://example.com/images/bacterial_wilt_detailed.jpg",
    "version": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Sync Remedies**

#### GET `/remedies/sync`
Get updated remedies since last sync.

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters:**
- `lastSyncTime` (string): ISO timestamp of last sync

**Response (200):**
```json
{
  "remedies": [
    {
      "id": "uuid-string",
      "diseaseName": "Updated Remedy",
      "diseaseCode": "updated_remedy",
      "description": "Updated description...",
      "symptoms": ["Updated symptoms"],
      "treatments": ["Updated treatments"],
      "severity": "medium",
      "version": 2,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "syncTime": "2024-01-01T00:00:00.000Z"
}
```

---

## 🤖 Model Endpoints

### **Get Active Model**

#### GET `/models/active`
Get the currently active ML model.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "model": {
    "id": "uuid-string",
    "name": "GingerNet v1.0",
    "version": "1.0.0",
    "description": "CNN model for ginger disease detection",
    "inputShape": [224, 224, 3],
    "outputClasses": [
      "healthy",
      "bacterial_wilt", 
      "rhizome_rot",
      "leaf_spot",
      "soft_rot",
      "yellow_disease",
      "root_knot_nematode"
    ],
    "accuracy": 0.92,
    "isActive": true,
    "downloadUrl": "https://api.gingerlyai.com/models/uuid-string/download",
    "checksum": "sha256-hash",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Check Model Updates**

#### GET `/models/updates`
Check for available model updates.

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters:**
- `currentVersion` (string): Current model version
- `modelName` (string): Current model name

**Response (200):**
```json
{
  "updateAvailable": true,
  "currentModel": {
    "id": "uuid-string",
    "name": "GingerNet v2.0",
    "version": "2.0.0",
    "description": "Improved CNN model with better accuracy",
    "inputShape": [224, 224, 3],
    "outputClasses": ["healthy", "bacterial_wilt", "rhizome_rot", "leaf_spot", "soft_rot", "yellow_disease", "root_knot_nematode"],
    "accuracy": 0.95,
    "downloadUrl": "https://api.gingerlyai.com/models/new-uuid/download",
    "checksum": "sha256-new-hash",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Download Model**

#### GET `/models/:id/download`
Download ML model file.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200):**
- Content-Type: `application/octet-stream`
- Binary model file data

---

## 👥 User Management (Admin Only)

### **Get All Users**

#### GET `/users`
Get all users (Admin only).

**Headers**: `Authorization: Bearer <admin_access_token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search in name or email
- `role` (string): Filter by role

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-string",
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "lastLoginAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 📊 Admin Endpoints

### **Get All Predictions (Admin)**

#### GET `/predictions/admin/all`
Get all predictions from all users (Admin only).

**Headers**: `Authorization: Bearer <admin_access_token>`

**Query Parameters:**
- Same as user predictions endpoint
- `userId` (string): Filter by specific user

**Response (200):**
```json
{
  "predictions": [
    {
      "id": "uuid-string",
      "topPrediction": "bacterial_wilt",
      "confidence": 0.85,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "uuid-string",
        "name": "John Farmer",
        "email": "john@example.com"
      },
      "remedy": {
        "diseaseName": "Bacterial Wilt"
      }
    }
  ],
  "pagination": {
    "total": 1000,
    "page": 1,
    "limit": 10,
    "totalPages": 100
  }
}
```

---

## 🚨 Error Responses

### **Standard Error Format**
```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### **HTTP Status Codes**

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation errors) |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry) |
| `413` | Payload Too Large |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

### **Common Error Examples**

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "error": "Invalid token",
  "message": "Authentication token is invalid"
}
```

**Authorization Error (403):**
```json
{
  "error": "Insufficient permissions",
  "message": "Access denied. Required roles: admin"
}
```

**Rate Limit Error (429):**
```json
{
  "error": "Too many requests",
  "message": "Please try again later"
}
```

---

## 🔄 Rate Limiting

### **Limits**

| Endpoint | Limit |
|----------|-------|
| `/auth/register` | 10 requests per 15 minutes |
| `/auth/login` | 5 requests per 15 minutes |
| `/auth/refresh` | 10 requests per 15 minutes |
| All other endpoints | 100 requests per 15 minutes |

### **Headers**
Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔍 Filtering & Searching

### **Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (starts from 1) |
| `limit` | number | Items per page (max 100) |
| `sort` | string | Field to sort by |
| `order` | string | "ASC" or "DESC" |
| `search` | string | Search term |

### **Date Filtering**
Use ISO 8601 format for date parameters:
```
?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z
```

---

## 📝 Examples

### **Complete Authentication Flow**

1. **Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com", 
    "password": "password123"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Create Prediction:**
```bash
curl -X POST http://localhost:3000/api/predictions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "model-uuid",
    "imageUrl": "data:image/jpeg;base64,...",
    "predictionResults": {...},
    "topPrediction": "bacterial_wilt",
    "confidence": 0.85
  }'
```

---

## 🔧 Development & Testing

### **Environment Variables**
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_NAME=gingerlyai_db
```

### **Testing with Postman**
Import the Postman collection (available in `/docs/postman/`) for easy API testing.

---

This API documentation provides comprehensive coverage of all endpoints, request/response formats, authentication requirements, and error handling for the GingerlyAI backend service.
