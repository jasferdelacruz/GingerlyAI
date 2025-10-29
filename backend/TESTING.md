# 🧪 Backend Testing Guide

Comprehensive testing documentation for the GingerlyAI backend API.

---

## 📋 **Table of Contents**

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Writing Tests](#writing-tests)
6. [Test Suites](#test-suites)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.controller.test.js
```

---

## 📁 **Test Structure**

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── controllers/
│   │   │   ├── auth.controller.test.js
│   │   │   ├── prediction.controller.test.js
│   │   │   ├── remedy.controller.test.js
│   │   │   └── user.controller.test.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.test.js
│   │   │   ├── validation.middleware.test.js
│   │   │   └── errorHandler.middleware.test.js
│   │   ├── routes/
│   │   │   └── integration.test.js
│   │   └── models/
│   │       └── user.model.test.js
├── jest.config.js
├── jest.setup.js
└── TESTING.md (this file)
```

---

## 🧪 **Running Tests**

### **Run All Tests**

```bash
npm test
```

### **Run Specific Test Suite**

```bash
# Run only auth controller tests
npm test auth.controller

# Run only middleware tests
npm test middleware

# Run only validation tests
npm test validation
```

### **Watch Mode** (Re-run on file changes)

```bash
npm run test:watch
```

### **Coverage Report**

```bash
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

### **Verbose Output**

```bash
npm test -- --verbose
```

### **Run Tests in CI/CD**

```bash
npm run test:ci
```

---

## 📊 **Test Coverage**

### **Coverage Goals**

| Metric | Target | Current |
|--------|--------|---------|
| **Statements** | 70% | TBD |
| **Branches** | 70% | TBD |
| **Functions** | 70% | TBD |
| **Lines** | 70% | TBD |

### **Coverage Reports**

Coverage reports are generated in:
- **Terminal**: Summary after running tests with `--coverage`
- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-final.json`
- **LCOV**: `coverage/lcov.info`

### **Viewing Coverage**

```bash
# Generate and view coverage
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## ✍️ **Writing Tests**

### **Basic Test Structure**

```javascript
const request = require('supertest');
const app = require('../server');

describe('Feature Name', () => {
  // Setup before all tests
  beforeAll(async () => {
    // Initialize database, create test data, etc.
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Close connections, cleanup test data
  });

  // Setup before each test
  beforeEach(() => {
    // Reset state between tests
  });

  // Cleanup after each test
  afterEach(() => {
    // Clean up after each test
  });

  describe('Specific functionality', () => {
    it('should do something correctly', async () => {
      // Arrange
      const testData = { /* ... */ };

      // Act
      const result = await someFunction(testData);

      // Assert
      expect(result).toBe(expectedValue);
    });

    it('should handle errors properly', async () => {
      // Test error cases
      expect(() => someFunction()).toThrow();
    });
  });
});
```

### **Testing API Endpoints**

```javascript
describe('POST /api/auth/login', () => {
  it('should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tokens');
    expect(response.body.tokens).toHaveProperty('accessToken');
  });

  it('should fail with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
```

### **Testing Middleware**

```javascript
describe('authenticate middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should authenticate valid token', async () => {
    mockReq.headers.authorization = `Bearer ${validToken}`;

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
  });
});
```

### **Testing with Database**

```javascript
describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  it('should create user successfully', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123'
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@test.com');
  });
});
```

### **Mocking**

```javascript
// Mock external dependencies
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Mock database calls
jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

// Restore original implementation
User.findOne.mockRestore();
```

---

## 🔍 **Test Suites**

### **1. Controller Tests**

Test all controller functions:
- ✅ Valid inputs produce expected outputs
- ✅ Invalid inputs throw proper errors
- ✅ Authorization is enforced
- ✅ Database interactions work correctly

**Files:**
- `auth.controller.test.js` - Authentication endpoints
- `prediction.controller.test.js` - Prediction CRUD
- `remedy.controller.test.js` - Remedy management
- `user.controller.test.js` - User management

### **2. Middleware Tests**

Test middleware functionality:
- ✅ Authentication middleware
- ✅ Authorization middleware
- ✅ Validation middleware
- ✅ Error handling

**Files:**
- `auth.middleware.test.js`
- `validation.middleware.test.js`
- `errorHandler.middleware.test.js`

### **3. Model Tests**

Test database models:
- ✅ Model creation
- ✅ Validation rules
- ✅ Associations
- ✅ Instance methods
- ✅ Class methods

### **4. Integration Tests**

Test complete workflows:
- ✅ User registration → Login → Access protected routes
- ✅ Create prediction → Get predictions → Sync predictions
- ✅ Error handling across the stack

### **5. Admin Tests**

Test admin-specific functionality:
- ✅ Admin-only endpoints
- ✅ User management
- ✅ Remedy management
- ✅ Model management

---

## 🧰 **Testing Utilities**

### **Helper Functions**

Create reusable test helpers in `src/__tests__/helpers/`:

```javascript
// testHelpers.js
module.exports = {
  createTestUser: async (overrides = {}) => {
    return await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      ...overrides
    });
  },

  getAuthToken: (user) => {
    return generateTokens(user).accessToken;
  },

  clearDatabase: async () => {
    await User.destroy({ where: {}, truncate: true });
    await Prediction.destroy({ where: {}, truncate: true });
    // ...clear all tables
  }
};
```

### **Test Fixtures**

Store test data in `src/__tests__/fixtures/`:

```javascript
// userData.js
module.exports = {
  validUser: {
    name: 'John Farmer',
    email: 'john@farm.com',
    password: 'securepass123',
    phone: '+1234567890',
    location: 'Farm Location',
    farmSize: 10.5
  },

  invalidUser: {
    name: 'A', // Too short
    email: 'invalid-email',
    password: '123' // Too short
  }
};
```

---

## 📈 **Best Practices**

### **1. Test Naming**

```javascript
// ✅ Good: Descriptive and specific
it('should return 401 when token is expired', () => {});

// ❌ Bad: Vague
it('should work', () => {});
```

### **2. Arrange-Act-Assert Pattern**

```javascript
it('should create user successfully', async () => {
  // Arrange
  const userData = { name: 'Test', email: 'test@test.com', password: '123456' };

  // Act
  const user = await User.create(userData);

  // Assert
  expect(user.email).toBe('test@test.com');
});
```

### **3. Test Independence**

```javascript
// ✅ Good: Each test is independent
beforeEach(async () => {
  await clearDatabase();
  testUser = await createTestUser();
});

// ❌ Bad: Tests depend on each other
it('creates user', () => { /* creates user 1 */ });
it('updates user', () => { /* depends on user from previous test */ });
```

### **4. Mock External Dependencies**

```javascript
// Mock email service to avoid sending real emails
jest.mock('../services/emailService');

// Mock file storage
jest.mock('../services/storageService');
```

### **5. Test Edge Cases**

```javascript
describe('User creation', () => {
  it('should handle valid data', () => {});
  it('should reject duplicate email', () => {});
  it('should reject invalid email format', () => {});
  it('should reject short password', () => {});
  it('should handle missing required fields', () => {});
  it('should handle special characters in name', () => {});
});
```

---

## 🐛 **Troubleshooting**

### **Tests Failing Randomly**

**Cause**: Tests not properly isolated, shared state between tests

**Solution**:
```javascript
beforeEach(async () => {
  // Clear database before each test
  await clearAllTables();
  // Reset mocks
  jest.clearAllMocks();
});
```

### **Timeout Errors**

**Cause**: Async operations not completing

**Solution**:
```javascript
// Increase timeout for specific test
it('should complete long operation', async () => {
  // test code
}, 10000); // 10 second timeout

// Or in jest.config.js
module.exports = {
  testTimeout: 10000
};
```

### **Database Connection Errors**

**Cause**: Database not properly initialized

**Solution**:
```javascript
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
```

### **Mock Not Working**

**Cause**: Mock defined after import

**Solution**:
```javascript
// ✅ Good: Mock before import
jest.mock('../services/someService');
const someService = require('../services/someService');

// ❌ Bad: Mock after import
const someService = require('../services/someService');
jest.mock('../services/someService'); // Too late!
```

---

## 📋 **Testing Checklist**

Before pushing code, ensure:

- [ ] All tests pass
- [ ] New features have tests
- [ ] Edge cases are covered
- [ ] Error cases are tested
- [ ] Coverage meets thresholds (70%)
- [ ] No console errors/warnings
- [ ] Tests are independent
- [ ] Mocks are properly cleaned up
- [ ] Database is properly reset between tests
- [ ] Integration tests cover critical paths

---

## 🎯 **Coverage by Component**

| Component | Test File | Coverage |
|-----------|-----------|----------|
| **Auth Controller** | `auth.controller.test.js` | Target: 100% |
| **Auth Middleware** | `auth.middleware.test.js` | Target: 100% |
| **Validation Middleware** | `validation.middleware.test.js` | Target: 100% |
| **Error Handler** | `errorHandler.middleware.test.js` | Target: 100% |
| **Prediction Controller** | `prediction.controller.test.js` | Target: 90% |
| **Remedy Controller** | `remedy.controller.test.js` | Target: 90% |
| **User Model** | `user.model.test.js` | Target: 90% |

---

## 🔄 **Continuous Integration**

### **GitHub Actions**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

---

## 📚 **Additional Resources**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

*Backend Testing Guide for GingerlyAI* 🧪

