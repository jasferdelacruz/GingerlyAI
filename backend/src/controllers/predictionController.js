const { Prediction, User, Remedy, Model } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Create new prediction
 */
const createPrediction = async (req, res, next) => {
  try {
    const {
      remedyId,
      modelId,
      imageUrl,
      predictionResults,
      topPrediction,
      confidence,
      isOfflinePrediction,
      deviceInfo,
      location,
      notes
    } = req.body;

    // Verify model exists
    const model = await Model.findByPk(modelId);
    if (!model) {
      throw new AppError('Model not found', 404);
    }

    // Verify remedy exists if provided
    if (remedyId) {
      const remedy = await Remedy.findByPk(remedyId);
      if (!remedy) {
        throw new AppError('Remedy not found', 404);
      }
    }

    const prediction = await Prediction.create({
      userId: req.user.id,
      remedyId,
      modelId,
      imageUrl,
      predictionResults,
      topPrediction,
      confidence,
      isOfflinePrediction: isOfflinePrediction !== undefined ? isOfflinePrediction : true,
      deviceInfo,
      location,
      notes,
      synced: true, // Mark as synced since it's being created on server
      syncedAt: new Date()
    });

    // Include related data in response
    const predictionWithRelations = await Prediction.findByPk(prediction.id, {
      include: [
        { model: Remedy, as: 'remedy' },
        { model: Model, as: 'model' }
      ]
    });

    res.status(201).json({
      message: 'Prediction created successfully',
      prediction: predictionWithRelations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's predictions
 */
const getUserPredictions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC',
      topPrediction,
      minConfidence,
      maxConfidence,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId: req.user.id };

    // Add filters
    if (topPrediction) {
      whereClause.topPrediction = { [Op.iLike]: `%${topPrediction}%` };
    }

    if (minConfidence !== undefined) {
      whereClause.confidence = { [Op.gte]: parseFloat(minConfidence) };
    }

    if (maxConfidence !== undefined) {
      whereClause.confidence = {
        ...whereClause.confidence,
        [Op.lte]: parseFloat(maxConfidence)
      };
    }

    if (startDate) {
      whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    const { count, rows: predictions } = await Prediction.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [
        { model: Remedy, as: 'remedy' },
        { model: Model, as: 'model' }
      ]
    });

    res.json({
      predictions,
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
 * Get prediction by ID
 */
const getPredictionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prediction = await Prediction.findOne({
      where: { id, userId: req.user.id },
      include: [
        { model: Remedy, as: 'remedy' },
        { model: Model, as: 'model' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!prediction) {
      throw new AppError('Prediction not found', 404);
    }

    res.json({ prediction });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync offline predictions
 */
const syncPredictions = async (req, res, next) => {
  try {
    const { predictions } = req.body;
    const syncResults = [];

    for (const predictionData of predictions) {
      try {
        // Verify model exists
        const model = await Model.findByPk(predictionData.modelId);
        if (!model) {
          syncResults.push({
            clientId: predictionData.id,
            status: 'error',
            message: 'Model not found'
          });
          continue;
        }

        // Verify remedy exists if provided
        if (predictionData.remedyId) {
          const remedy = await Remedy.findByPk(predictionData.remedyId);
          if (!remedy) {
            syncResults.push({
              clientId: predictionData.id,
              status: 'error',
              message: 'Remedy not found'
            });
            continue;
          }
        }

        const prediction = await Prediction.create({
          userId: req.user.id,
          remedyId: predictionData.remedyId,
          modelId: predictionData.modelId,
          imageUrl: predictionData.imageUrl,
          predictionResults: predictionData.predictionResults,
          topPrediction: predictionData.topPrediction,
          confidence: predictionData.confidence,
          isOfflinePrediction: predictionData.isOfflinePrediction !== undefined ? predictionData.isOfflinePrediction : true,
          deviceInfo: predictionData.deviceInfo,
          location: predictionData.location,
          notes: predictionData.notes,
          synced: true,
          syncedAt: new Date(),
          createdAt: predictionData.createdAt || new Date()
        });

        syncResults.push({
          clientId: predictionData.id,
          serverId: prediction.id,
          status: 'success',
          message: 'Synced successfully'
        });
      } catch (error) {
        syncResults.push({
          clientId: predictionData.id,
          status: 'error',
          message: error.message
        });
      }
    }

    res.json({
      message: 'Sync completed',
      results: syncResults,
      syncTime: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete prediction
 */
const deletePrediction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prediction = await Prediction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!prediction) {
      throw new AppError('Prediction not found', 404);
    }

    await prediction.destroy();

    res.json({
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all predictions (Admin only)
 */
const getAllPredictions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC',
      userId,
      topPrediction,
      minConfidence,
      maxConfidence,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (userId) {
      whereClause.userId = userId;
    }

    if (topPrediction) {
      whereClause.topPrediction = { [Op.iLike]: `%${topPrediction}%` };
    }

    if (minConfidence !== undefined) {
      whereClause.confidence = { [Op.gte]: parseFloat(minConfidence) };
    }

    if (maxConfidence !== undefined) {
      whereClause.confidence = {
        ...whereClause.confidence,
        [Op.lte]: parseFloat(maxConfidence)
      };
    }

    if (startDate) {
      whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    const { count, rows: predictions } = await Prediction.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Remedy, as: 'remedy' },
        { model: Model, as: 'model' }
      ]
    });

    res.json({
      predictions,
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
 * Get prediction statistics
 */
const getPredictionStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const whereClause = isAdmin ? {} : { userId: req.user.id };

    const totalPredictions = await Prediction.count({ where: whereClause });

    // Count by top prediction (disease types)
    const diseaseStats = await Prediction.findAll({
      attributes: [
        'topPrediction',
        [Prediction.sequelize.fn('COUNT', '*'), 'count'],
        [Prediction.sequelize.fn('AVG', Prediction.sequelize.col('confidence')), 'avgConfidence']
      ],
      where: whereClause,
      group: ['topPrediction'],
      order: [[Prediction.sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10,
      raw: true
    });

    // Recent predictions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPredictions = await Prediction.count({
      where: {
        ...whereClause,
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Average confidence score
    const avgConfidence = await Prediction.findOne({
      attributes: [[Prediction.sequelize.fn('AVG', Prediction.sequelize.col('confidence')), 'avgConfidence']],
      where: whereClause,
      raw: true
    });

    res.json({
      stats: {
        total: totalPredictions,
        recent: recentPredictions,
        averageConfidence: parseFloat(avgConfidence.avgConfidence || 0).toFixed(4),
        topDiseases: diseaseStats.map(stat => ({
          disease: stat.topPrediction,
          count: parseInt(stat.count),
          avgConfidence: parseFloat(stat.avgConfidence).toFixed(4)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrediction,
  getUserPredictions,
  getPredictionById,
  syncPredictions,
  deletePrediction,
  getAllPredictions,
  getPredictionStats
};
