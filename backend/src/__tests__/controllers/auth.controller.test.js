const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const { User, RefreshToken } = require('../../models');
const { generateTokens } = require('../../config/jwt');
const errorHandler = require('../../middleware/errorHandler');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler.errorHandler);

describe('Auth Controller Tests', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Setup test database connection
    await require('../../models').sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await require('../../models').sequelize.close();
  });

  beforeEach(async () => {
    // Clear test data - force delete with cascade
    try {
      await RefreshToken.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
    } catch (error) {
      // If tables don't exist yet, that's fine
      console.log('Cleanup error (expected on first run):', error.message);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Farmer',
          email: 'farmer@test.com',
          password: 'password123',
          phone: '+1234567890',
          location: 'Test Farm',
          farmSize: 5.5
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'farmer@test.com');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should fail with duplicate email', async () => {
      // Create first user
      await User.create({
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'existing@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        isActive: true
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'farmer@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');

      accessToken = response.body.tokens.accessToken;
      refreshToken = response.body.tokens.refreshToken;
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'farmer@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail for deactivated account', async () => {
      await testUser.update({ isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'farmer@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should update lastLoginAt on successful login', async () => {
      const beforeLogin = testUser.lastLoginAt;

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'farmer@test.com',
          password: 'password123'
        });

      await testUser.reload();
      expect(testUser.lastLoginAt).not.toBe(beforeLogin);
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Create test user and tokens
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        isActive: true
      });

      const tokens = generateTokens(testUser);
      refreshToken = tokens.refreshToken;

      await RefreshToken.create({
        userId: testUser.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with revoked refresh token', async () => {
      await RefreshToken.update(
        { isRevoked: true },
        { where: { token: refreshToken } }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        isActive: true
      });

      const tokens = generateTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'farmer@test.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        phone: '+1234567890',
        location: 'Old Location',
        farmSize: 5,
        isActive: true
      });

      const tokens = generateTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('should update profile successfully', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Farmer',
          location: 'New Location',
          farmSize: 10
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.user).toHaveProperty('name', 'Updated Farmer');
      expect(response.body.user).toHaveProperty('location', 'New Location');
      expect(response.body.user).toHaveProperty('farmSize', 10);
    });

    it('should fail without authorization', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'A', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        isActive: true
      });

      const tokens = generateTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password changed successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'farmer@test.com',
          password: 'newpassword123'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should fail with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should revoke all tokens after password change', async () => {
      // Create a refresh token
      const tokens = generateTokens(testUser);
      await RefreshToken.create({
        userId: testUser.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      // Check that refresh token is revoked
      const revokedTokens = await RefreshToken.findAll({
        where: { userId: testUser.id, isRevoked: true }
      });

      expect(revokedTokens.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        isActive: true
      });

      const tokens = generateTokens(testUser);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;

      await RefreshToken.create({
        userId: testUser.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');

      // Verify token is revoked
      const token = await RefreshToken.findOne({ where: { token: refreshToken } });
      expect(token.isRevoked).toBe(true);
    });
  });

  describe('POST /api/auth/logout-all', () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        isActive: true
      });

      const tokens = generateTokens(testUser);
      accessToken = tokens.accessToken;

      // Create multiple refresh tokens
      for (let i = 0; i < 3; i++) {
        const tokens = generateTokens(testUser);
        await RefreshToken.create({
          userId: testUser.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    });

    it('should logout from all devices successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out from all devices');

      // Verify all tokens are revoked
      const tokens = await RefreshToken.findAll({
        where: { userId: testUser.id, isRevoked: false }
      });

      expect(tokens.length).toBe(0);
    });
  });
});

