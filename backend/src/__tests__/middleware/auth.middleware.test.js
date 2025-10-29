const { authenticate, authorize, requireAdmin, requireUser, optionalAuth } = require('../../middleware/auth');
const { User } = require('../../models');
const { generateTokens } = require('../../config/jwt');

describe('Auth Middleware Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let testUser;
  let validToken;

  beforeAll(async () => {
    await require('../../models').sequelize.sync({ force: true });
    
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      role: 'user',
      isActive: true
    });

    const tokens = generateTokens(testUser);
    validToken = tokens.accessToken;
  });

  afterAll(async () => {
    await require('../../models').sequelize.close();
  });

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {},
      params: {},
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('authenticate middleware', () => {
    it('should authenticate with valid token', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.email).toBe('test@test.com');
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should fail without authorization header', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access token required' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail with invalid token format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail with invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid token' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail for inactive user', async () => {
      await testUser.update({ isActive: false });
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();

      // Restore user status
      await testUser.update({ isActive: true });
    });

    it('should attach user object to request', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.user).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        role: testUser.role
      });
    });
  });

  describe('authorize middleware', () => {
    beforeEach(() => {
      mockReq.user = {
        id: testUser.id,
        email: testUser.email,
        role: 'user'
      };
    });

    it('should allow user with correct role', () => {
      const middleware = authorize('user', 'admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny user without correct role', () => {
      mockReq.user.role = 'guest';
      const middleware = authorize('user', 'admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Insufficient permissions' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny unauthenticated request', () => {
      delete mockReq.user;
      const middleware = authorize('user');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should check multiple roles', () => {
      mockReq.user.role = 'admin';
      const middleware = authorize('user', 'admin', 'moderator');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAdmin middleware', () => {
    it('should allow admin users', () => {
      mockReq.user = { id: 1, role: 'admin' };
      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny non-admin users', () => {
      mockReq.user = { id: 1, role: 'user' };
      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireUser middleware', () => {
    it('should allow user role', () => {
      mockReq.user = { id: 1, role: 'user' };
      requireUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow admin role', () => {
      mockReq.user = { id: 1, role: 'admin' };
      requireUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny other roles', () => {
      mockReq.user = { id: 1, role: 'guest' };
      requireUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('optionalAuth middleware', () => {
    it('should attach user with valid token', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should continue without token', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should continue with invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should not fail for inactive user', async () => {
      await testUser.update({ isActive: false });
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();

      // Restore
      await testUser.update({ isActive: true });
    });
  });
});

