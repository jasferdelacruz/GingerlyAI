const { Model } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all models
 */
const getAllModels = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC', activeOnly } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (activeOnly === 'true') {
      whereClause.isActive = true;
    }

    const { count, rows: models } = await Model.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });

    res.json({
      models,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get model by ID
 */
const getModelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    res.json({ model });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active model for mobile app
 */
const getActiveModel = async (req, res, next) => {
  try {
    const activeModel = await Model.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    if (!activeModel) {
      throw new AppError('No active model found', 404);
    }

    res.json({ model: activeModel });
  } catch (error) {
    next(error);
  }
};

/**
 * Get default model for new installations
 */
const getDefaultModel = async (req, res, next) => {
  try {
    const defaultModel = await Model.findOne({
      where: { isDefault: true }
    });

    if (!defaultModel) {
      // If no default model, return the latest active model
      const latestModel = await Model.findOne({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      });

      if (!latestModel) {
        throw new AppError('No available model found', 404);
      }

      return res.json({ model: latestModel });
    }

    res.json({ model: defaultModel });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new model (Admin only)
 */
const createModel = async (req, res, next) => {
  try {
    const {
      name,
      version,
      description,
      inputShape,
      outputClasses,
      accuracy,
      trainingDate,
      metadata
    } = req.body;

    // Check if model with same name and version exists
    const existingModel = await Model.findOne({
      where: { name, version }
    });

    if (existingModel) {
      throw new AppError('Model with this name and version already exists', 409);
    }

    const model = await Model.create({
      name,
      version,
      description,
      modelPath: '', // Will be updated after file upload
      weightsPath: '', // Will be updated after file upload
      modelSize: 0, // Will be updated after file upload
      inputShape,
      outputClasses,
      accuracy,
      trainingDate,
      metadata,
      downloadUrl: '', // Will be generated after file upload
      checksum: '' // Will be calculated after file upload
    });

    res.status(201).json({
      message: 'Model created successfully',
      model
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update model (Admin only)
 */
const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      version,
      description,
      inputShape,
      outputClasses,
      accuracy,
      trainingDate,
      isActive,
      isDefault,
      metadata
    } = req.body;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    // Check if name and version combination is being changed and if it already exists
    if ((name && name !== model.name) || (version && version !== model.version)) {
      const existingModel = await Model.findOne({
        where: {
          name: name || model.name,
          version: version || model.version,
          id: { [Op.ne]: id }
        }
      });

      if (existingModel) {
        throw new AppError('Model with this name and version already exists', 409);
      }
    }

    await model.update({
      name: name !== undefined ? name : model.name,
      version: version !== undefined ? version : model.version,
      description: description !== undefined ? description : model.description,
      inputShape: inputShape !== undefined ? inputShape : model.inputShape,
      outputClasses: outputClasses !== undefined ? outputClasses : model.outputClasses,
      accuracy: accuracy !== undefined ? accuracy : model.accuracy,
      trainingDate: trainingDate !== undefined ? trainingDate : model.trainingDate,
      isActive: isActive !== undefined ? isActive : model.isActive,
      isDefault: isDefault !== undefined ? isDefault : model.isDefault,
      metadata: metadata !== undefined ? metadata : model.metadata
    });

    res.json({
      message: 'Model updated successfully',
      model
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload model files (Admin only)
 */
const uploadModelFiles = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    if (!req.files || !req.files.modelFile) {
      throw new AppError('Model file is required', 400);
    }

    const modelFile = req.files.modelFile;
    const modelDir = path.join(process.env.MODEL_STORAGE_PATH || 'models', model.name, model.version);

    // Create directory if it doesn't exist
    await fs.mkdir(modelDir, { recursive: true });

    // Save model.json
    const modelPath = path.join(modelDir, 'model.json');
    await fs.writeFile(modelPath, modelFile.data);

    // Calculate file size and checksum
    const stats = await fs.stat(modelPath);
    const crypto = require('crypto');
    const fileContent = await fs.readFile(modelPath);
    const checksum = crypto.createHash('md5').update(fileContent).digest('hex');

    // Generate download URL
    const downloadUrl = `${process.env.MODEL_BASE_URL || 'http://localhost:3000/api/models'}/${model.id}/download`;

    await model.update({
      modelPath,
      weightsPath: modelDir, // Directory containing weight files
      modelSize: stats.size,
      downloadUrl,
      checksum
    });

    res.json({
      message: 'Model files uploaded successfully',
      model
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download model files
 */
const downloadModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    if (!model.modelPath || !model.downloadUrl) {
      throw new AppError('Model files not available', 404);
    }

    // Check if model file exists
    try {
      await fs.access(model.modelPath);
    } catch (error) {
      throw new AppError('Model file not found on disk', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=model-${model.name}-${model.version}.json`);
    res.setHeader('Content-Length', model.modelSize);

    // Stream the file
    const fileStream = require('fs').createReadStream(model.modelPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Activate model (Admin only)
 */
const activateModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    await model.update({ isActive: true });

    res.json({
      message: 'Model activated successfully',
      model
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate model (Admin only)
 */
const deactivateModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    await model.update({ isActive: false });

    res.json({
      message: 'Model deactivated successfully',
      model
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set as default model (Admin only)
 */
const setDefaultModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    await model.update({ isDefault: true });

    res.json({
      message: 'Model set as default successfully',
      model
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete model (Admin only)
 */
const deleteModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    // Don't allow deletion of active or default models
    if (model.isActive) {
      throw new AppError('Cannot delete active model', 400);
    }

    if (model.isDefault) {
      throw new AppError('Cannot delete default model', 400);
    }

    // Delete model files if they exist
    if (model.modelPath) {
      try {
        await fs.unlink(model.modelPath);
      } catch (error) {
        // File might not exist, continue with deletion
      }
    }

    await model.destroy();

    res.json({
      message: 'Model deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check for model updates
 */
const checkModelUpdates = async (req, res, next) => {
  try {
    const { currentVersion, modelName } = req.query;

    let whereClause = { isActive: true };
    
    if (modelName) {
      whereClause.name = modelName;
    }

    const latestModel = await Model.findOne({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    if (!latestModel) {
      return res.json({
        updateAvailable: false,
        message: 'No active model found'
      });
    }

    const updateAvailable = currentVersion !== latestModel.version;

    res.json({
      updateAvailable,
      currentModel: latestModel,
      message: updateAvailable ? 'Update available' : 'Model is up to date'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllModels,
  getModelById,
  getActiveModel,
  getDefaultModel,
  createModel,
  updateModel,
  uploadModelFiles,
  downloadModel,
  activateModel,
  deactivateModel,
  setDefaultModel,
  deleteModel,
  checkModelUpdates
};
