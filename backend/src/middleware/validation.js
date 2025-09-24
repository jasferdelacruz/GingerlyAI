const Joi = require('joi');

/**
 * Generic validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req[property] = value;
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    location: Joi.string().max(255).optional(),
    farmSize: Joi.number().positive().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    location: Joi.string().max(255).optional(),
    farmSize: Joi.number().positive().optional()
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(255).required()
  }),

  createUser: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().valid('user', 'admin').default('user'),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    location: Joi.string().max(255).optional(),
    farmSize: Joi.number().positive().optional()
  })
};

// Remedy validation schemas
const remedySchemas = {
  create: Joi.object({
    diseaseName: Joi.string().min(2).max(100).required(),
    diseaseCode: Joi.string().min(2).max(20).required(),
    description: Joi.string().required(),
    symptoms: Joi.array().items(Joi.string()).min(1).required(),
    causes: Joi.array().items(Joi.string()).optional(),
    treatments: Joi.array().items(Joi.string()).min(1).required(),
    preventionMeasures: Joi.array().items(Joi.string()).optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    imageUrl: Joi.string().uri().optional()
  }),

  update: Joi.object({
    diseaseName: Joi.string().min(2).max(100).optional(),
    diseaseCode: Joi.string().min(2).max(20).optional(),
    description: Joi.string().optional(),
    symptoms: Joi.array().items(Joi.string()).min(1).optional(),
    causes: Joi.array().items(Joi.string()).optional(),
    treatments: Joi.array().items(Joi.string()).min(1).optional(),
    preventionMeasures: Joi.array().items(Joi.string()).optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    imageUrl: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional()
  })
};

// Prediction validation schemas
const predictionSchemas = {
  create: Joi.object({
    remedyId: Joi.string().uuid().optional(),
    modelId: Joi.string().uuid().required(),
    imageUrl: Joi.string().required(),
    predictionResults: Joi.object().required(),
    topPrediction: Joi.string().required(),
    confidence: Joi.number().min(0).max(1).required(),
    isOfflinePrediction: Joi.boolean().default(true),
    deviceInfo: Joi.object().optional(),
    location: Joi.object().optional(),
    notes: Joi.string().optional()
  }),

  sync: Joi.object({
    predictions: Joi.array().items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        remedyId: Joi.string().uuid().optional(),
        modelId: Joi.string().uuid().required(),
        imageUrl: Joi.string().required(),
        predictionResults: Joi.object().required(),
        topPrediction: Joi.string().required(),
        confidence: Joi.number().min(0).max(1).required(),
        isOfflinePrediction: Joi.boolean().default(true),
        deviceInfo: Joi.object().optional(),
        location: Joi.object().optional(),
        notes: Joi.string().optional(),
        createdAt: Joi.date().optional()
      })
    ).min(1).required()
  })
};

// Model validation schemas
const modelSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    version: Joi.string().required(),
    description: Joi.string().optional(),
    inputShape: Joi.object().required(),
    outputClasses: Joi.array().items(Joi.string()).min(1).required(),
    accuracy: Joi.number().min(0).max(1).optional(),
    trainingDate: Joi.date().optional(),
    metadata: Joi.object().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    version: Joi.string().optional(),
    description: Joi.string().optional(),
    inputShape: Joi.object().optional(),
    outputClasses: Joi.array().items(Joi.string()).min(1).optional(),
    accuracy: Joi.number().min(0).max(1).optional(),
    trainingDate: Joi.date().optional(),
    isActive: Joi.boolean().optional(),
    isDefault: Joi.boolean().optional(),
    metadata: Joi.object().optional()
  })
};

// Query parameter validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('ASC', 'DESC').default('DESC')
  }),

  predictionFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('ASC', 'DESC').default('DESC'),
    topPrediction: Joi.string().optional(),
    minConfidence: Joi.number().min(0).max(1).optional(),
    maxConfidence: Joi.number().min(0).max(1).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  })
};

module.exports = {
  validate,
  userSchemas,
  remedySchemas,
  predictionSchemas,
  modelSchemas,
  querySchemas
};
