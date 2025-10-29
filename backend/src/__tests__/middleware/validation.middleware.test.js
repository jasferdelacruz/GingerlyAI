const { validate, userSchemas, remedySchemas, predictionSchemas } = require('../../middleware/validation');

describe('Validation Middleware Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('validate function', () => {
    it('should pass validation with valid data', () => {
      const schema = userSchemas.register;
      mockReq.body = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid data', () => {
      const schema = userSchemas.register;
      mockReq.body = {
        name: 'A', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      };

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should strip unknown fields', () => {
      const schema = userSchemas.register;
      mockReq.body = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        unknownField: 'should be removed'
      };

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body).not.toHaveProperty('unknownField');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const schema = userSchemas.login;
      mockReq.query = {
        email: 'test@test.com',
        password: 'password123'
      };

      const middleware = validate(schema, 'query');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('User Schemas', () => {
    describe('register schema', () => {
      it('should validate valid registration data', () => {
        mockReq.body = {
          name: 'John Farmer',
          email: 'john@farm.com',
          password: 'securepass123',
          phone: '+1234567890',
          location: 'Farm Location',
          farmSize: 10.5
        };

        const middleware = validate(userSchemas.register);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should fail with short name', () => {
        mockReq.body = {
          name: 'A',
          email: 'test@test.com',
          password: 'password123'
        };

        const middleware = validate(userSchemas.register);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should fail with invalid email', () => {
        mockReq.body = {
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123'
        };

        const middleware = validate(userSchemas.register);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should fail with short password', () => {
        mockReq.body = {
          name: 'Test User',
          email: 'test@test.com',
          password: '123'
        };

        const middleware = validate(userSchemas.register);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should accept optional fields', () => {
        mockReq.body = {
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123'
          // Optional fields omitted
        };

        const middleware = validate(userSchemas.register);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should validate phone number format', () => {
        mockReq.body = {
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          phone: '+12345678901234567890' // Too long
        };

        const middleware = validate(userSchemas.register);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });
    });

    describe('login schema', () => {
      it('should validate login credentials', () => {
        mockReq.body = {
          email: 'test@test.com',
          password: 'password123'
        };

        const middleware = validate(userSchemas.login);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should require both email and password', () => {
        mockReq.body = {
          email: 'test@test.com'
          // Missing password
        };

        const middleware = validate(userSchemas.login);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });
    });

    describe('updateProfile schema', () => {
      it('should allow partial updates', () => {
        mockReq.body = {
          name: 'Updated Name'
          // Other fields omitted
        };

        const middleware = validate(userSchemas.updateProfile);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should validate updated fields', () => {
        mockReq.body = {
          name: 'A', // Too short
          farmSize: -5 // Negative
        };

        const middleware = validate(userSchemas.updateProfile);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe('Remedy Schemas', () => {
    describe('create schema', () => {
      it('should validate valid remedy data', () => {
        mockReq.body = {
          diseaseName: 'Bacterial Wilt',
          diseaseCode: 'bacterial_wilt',
          description: 'A serious disease',
          symptoms: ['Wilting', 'Yellowing'],
          causes: ['Bacteria'],
          treatments: ['Remove infected plants'],
          preventionMeasures: ['Crop rotation'],
          severity: 'high',
          imageUrl: 'https://example.com/image.jpg'
        };

        const middleware = validate(remedySchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should require symptoms array', () => {
        mockReq.body = {
          diseaseName: 'Test Disease',
          diseaseCode: 'test',
          description: 'Description',
          symptoms: [], // Empty array
          treatments: ['Treatment 1']
        };

        const middleware = validate(remedySchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should validate severity values', () => {
        mockReq.body = {
          diseaseName: 'Test Disease',
          diseaseCode: 'test',
          description: 'Description',
          symptoms: ['Symptom 1'],
          treatments: ['Treatment 1'],
          severity: 'invalid' // Invalid severity
        };

        const middleware = validate(remedySchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should validate image URL format', () => {
        mockReq.body = {
          diseaseName: 'Test Disease',
          diseaseCode: 'test',
          description: 'Description',
          symptoms: ['Symptom 1'],
          treatments: ['Treatment 1'],
          imageUrl: 'not-a-url'
        };

        const middleware = validate(remedySchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe('Prediction Schemas', () => {
    describe('create schema', () => {
      it('should validate valid prediction data', () => {
        mockReq.body = {
          modelId: '123e4567-e89b-12d3-a456-426614174000',
          imageUrl: 'data:image/png;base64,test',
          predictionResults: { class1: 0.8, class2: 0.2 },
          topPrediction: 'class1',
          confidence: 0.8,
          isOfflinePrediction: true,
          deviceInfo: { platform: 'ios' },
          location: { lat: 10, lng: 20 }
        };

        const middleware = validate(predictionSchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should validate confidence range', () => {
        mockReq.body = {
          modelId: '123e4567-e89b-12d3-a456-426614174000',
          imageUrl: 'test.jpg',
          predictionResults: {},
          topPrediction: 'class1',
          confidence: 1.5 // Invalid: > 1
        };

        const middleware = validate(predictionSchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should validate UUID format for modelId', () => {
        mockReq.body = {
          modelId: 'not-a-uuid',
          imageUrl: 'test.jpg',
          predictionResults: {},
          topPrediction: 'class1',
          confidence: 0.8
        };

        const middleware = validate(predictionSchemas.create);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });
    });

    describe('sync schema', () => {
      it('should validate array of predictions', () => {
        mockReq.body = {
          predictions: [
            {
              modelId: '123e4567-e89b-12d3-a456-426614174000',
              imageUrl: 'test.jpg',
              predictionResults: {},
              topPrediction: 'class1',
              confidence: 0.8
            },
            {
              modelId: '123e4567-e89b-12d3-a456-426614174000',
              imageUrl: 'test2.jpg',
              predictionResults: {},
              topPrediction: 'class2',
              confidence: 0.7
            }
          ]
        };

        const middleware = validate(predictionSchemas.sync);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should fail with empty predictions array', () => {
        mockReq.body = {
          predictions: []
        };

        const middleware = validate(predictionSchemas.sync);
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe('Error Formatting', () => {
    it('should format multiple validation errors', () => {
      mockReq.body = {
        name: 'A', // Too short
        email: 'invalid', // Invalid format
        password: '123' // Too short
      };

      const middleware = validate(userSchemas.register);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({ field: expect.any(String), message: expect.any(String) })
          ])
        })
      );
    });

    it('should include field path in error details', () => {
      mockReq.body = {
        name: 'Test',
        email: 'invalid-email',
        password: 'password123'
      };

      const middleware = validate(userSchemas.register);
      middleware(mockReq, mockRes, mockNext);

      const call = mockRes.json.mock.calls[0][0];
      expect(call.details).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    });
  });
});

