const { AppError, errorHandler, notFoundHandler } = require('../../middleware/errorHandler');

describe('Error Handler Middleware Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test',
      originalUrl: '/api/test'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('AppError class', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should default to status code 500', () => {
      const error = new AppError('Server error');

      expect(error.statusCode).toBe(500);
    });

    it('should be operational by default', () => {
      const error = new AppError('Test error', 400);

      expect(error.isOperational).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 400);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Custom error message', 400);

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Custom error message',
          statusCode: 400
        })
      );
    });

    it('should handle Sequelize validation errors', () => {
      const error = {
        name: 'SequelizeValidationError',
        errors: [
          { message: 'Email is required' },
          { message: 'Password must be at least 6 characters' }
        ]
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
          statusCode: 400,
          details: expect.arrayContaining([
            'Email is required',
            'Password must be at least 6 characters'
          ])
        })
      );
    });

    it('should handle Sequelize unique constraint errors', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        errors: [{ message: 'email must be unique' }]
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Duplicate entry',
          statusCode: 409
        })
      );
    });

    it('should handle JWT errors', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'invalid token'
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid token',
          statusCode: 401
        })
      );
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'jwt expired'
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Token expired',
          statusCode: 401
        })
      );
    });

    it('should handle generic errors', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
          statusCode: 500
        })
      );
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should log error details', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(console.error).toHaveBeenCalled();
    });

    it('should include request details in error response (dev)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.path).toBe('/test');
      expect(response.method).toBe('GET');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler middleware', () => {
    it('should create 404 error for unmatched routes', () => {
      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('/api/test'),
          statusCode: 404
        })
      );
    });

    it('should include requested URL in error message', () => {
      mockReq.originalUrl = '/api/nonexistent';

      notFoundHandler(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('/api/nonexistent');
    });

    it('should pass AppError to next middleware', () => {
      notFoundHandler(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('Error Response Format', () => {
    it('should have consistent error response structure', () => {
      const error = new AppError('Test error', 400);

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          statusCode: expect.any(Number),
          timestamp: expect.any(String)
        })
      );
    });

    it('should include timestamp in ISO format', () => {
      const error = new AppError('Test error', 400);

      errorHandler(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Status Code Handling', () => {
    it('should preserve custom status codes', () => {
      const testCases = [
        { code: 400, desc: 'Bad Request' },
        { code: 401, desc: 'Unauthorized' },
        { code: 403, desc: 'Forbidden' },
        { code: 404, desc: 'Not Found' },
        { code: 409, desc: 'Conflict' },
        { code: 500, desc: 'Internal Server Error' }
      ];

      testCases.forEach(({ code, desc }) => {
        const error = new AppError(desc, code);
        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(code);
        mockRes.status.mockClear();
        mockRes.json.mockClear();
      });
    });
  });
});

