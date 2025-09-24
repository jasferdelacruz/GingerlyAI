const { Remedy } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all remedies
 */
const getAllRemedies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC', search, severity } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { diseaseName: { [Op.iLike]: `%${search}%` } },
        { diseaseCode: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by severity
    if (severity) {
      whereClause.severity = severity;
    }

    const { count, rows: remedies } = await Remedy.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });

    res.json({
      remedies,
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
 * Get remedy by ID
 */
const getRemedyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const remedy = await Remedy.findOne({
      where: { id, isActive: true }
    });

    if (!remedy) {
      throw new AppError('Remedy not found', 404);
    }

    res.json({ remedy });
  } catch (error) {
    next(error);
  }
};

/**
 * Get remedy by disease code
 */
const getRemedyByCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const remedy = await Remedy.findOne({
      where: { diseaseCode: code, isActive: true }
    });

    if (!remedy) {
      throw new AppError('Remedy not found', 404);
    }

    res.json({ remedy });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new remedy (Admin only)
 */
const createRemedy = async (req, res, next) => {
  try {
    const {
      diseaseName,
      diseaseCode,
      description,
      symptoms,
      causes,
      treatments,
      preventionMeasures,
      severity,
      imageUrl
    } = req.body;

    // Check if disease code already exists
    const existingRemedy = await Remedy.findOne({ where: { diseaseCode } });
    if (existingRemedy) {
      throw new AppError('Remedy with this disease code already exists', 409);
    }

    const remedy = await Remedy.create({
      diseaseName,
      diseaseCode,
      description,
      symptoms,
      causes,
      treatments,
      preventionMeasures,
      severity,
      imageUrl
    });

    res.status(201).json({
      message: 'Remedy created successfully',
      remedy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update remedy (Admin only)
 */
const updateRemedy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      diseaseName,
      diseaseCode,
      description,
      symptoms,
      causes,
      treatments,
      preventionMeasures,
      severity,
      imageUrl,
      isActive
    } = req.body;

    const remedy = await Remedy.findByPk(id);
    if (!remedy) {
      throw new AppError('Remedy not found', 404);
    }

    // Check if disease code is being changed and if it already exists
    if (diseaseCode && diseaseCode !== remedy.diseaseCode) {
      const existingRemedy = await Remedy.findOne({ where: { diseaseCode } });
      if (existingRemedy) {
        throw new AppError('Remedy with this disease code already exists', 409);
      }
    }

    // Increment version when updating content
    const shouldIncrementVersion = 
      diseaseName !== undefined || 
      description !== undefined || 
      symptoms !== undefined || 
      treatments !== undefined || 
      preventionMeasures !== undefined;

    await remedy.update({
      diseaseName: diseaseName !== undefined ? diseaseName : remedy.diseaseName,
      diseaseCode: diseaseCode !== undefined ? diseaseCode : remedy.diseaseCode,
      description: description !== undefined ? description : remedy.description,
      symptoms: symptoms !== undefined ? symptoms : remedy.symptoms,
      causes: causes !== undefined ? causes : remedy.causes,
      treatments: treatments !== undefined ? treatments : remedy.treatments,
      preventionMeasures: preventionMeasures !== undefined ? preventionMeasures : remedy.preventionMeasures,
      severity: severity !== undefined ? severity : remedy.severity,
      imageUrl: imageUrl !== undefined ? imageUrl : remedy.imageUrl,
      isActive: isActive !== undefined ? isActive : remedy.isActive,
      version: shouldIncrementVersion ? remedy.version + 1 : remedy.version
    });

    res.json({
      message: 'Remedy updated successfully',
      remedy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete remedy (Admin only)
 */
const deleteRemedy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const remedy = await Remedy.findByPk(id);
    if (!remedy) {
      throw new AppError('Remedy not found', 404);
    }

    await remedy.destroy();

    res.json({
      message: 'Remedy deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get remedies for sync (returns all active remedies with version info)
 */
const getRemediesForSync = async (req, res, next) => {
  try {
    const { lastSyncTime } = req.query;

    let whereClause = { isActive: true };

    // If lastSyncTime is provided, only return remedies updated after that time
    if (lastSyncTime) {
      whereClause.updatedAt = {
        [Op.gt]: new Date(lastSyncTime)
      };
    }

    const remedies = await Remedy.findAll({
      where: whereClause,
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      remedies,
      syncTime: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get remedy statistics (Admin only)
 */
const getRemedyStats = async (req, res, next) => {
  try {
    const totalRemedies = await Remedy.count();
    const activeRemedies = await Remedy.count({ where: { isActive: true } });
    const inactiveRemedies = await Remedy.count({ where: { isActive: false } });

    // Count by severity
    const severityStats = await Remedy.findAll({
      attributes: [
        'severity',
        [Remedy.sequelize.fn('COUNT', '*'), 'count']
      ],
      where: { isActive: true },
      group: ['severity'],
      raw: true
    });

    // Recently updated remedies (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyUpdated = await Remedy.count({
      where: {
        updatedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      stats: {
        total: totalRemedies,
        active: activeRemedies,
        inactive: inactiveRemedies,
        recentlyUpdated,
        bySeverity: severityStats.reduce((acc, item) => {
          acc[item.severity] = parseInt(item.count);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRemedies,
  getRemedyById,
  getRemedyByCode,
  createRemedy,
  updateRemedy,
  deleteRemedy,
  getRemediesForSync,
  getRemedyStats
};
