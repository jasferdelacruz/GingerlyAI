const express = require('express');
const {
  createPrediction,
  getUserPredictions,
  getPredictionById,
  syncPredictions,
  deletePrediction,
  getAllPredictions,
  getPredictionStats
} = require('../controllers/predictionController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate, predictionSchemas, querySchemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', validate(querySchemas.predictionFilters, 'query'), getUserPredictions);
router.get('/stats', getPredictionStats);
router.get('/:id', getPredictionById);
router.post('/', validate(predictionSchemas.create), createPrediction);
router.post('/sync', validate(predictionSchemas.sync), syncPredictions);
router.delete('/:id', deletePrediction);

// Admin routes
router.get('/admin/all', requireAdmin, validate(querySchemas.predictionFilters, 'query'), getAllPredictions);

module.exports = router;
