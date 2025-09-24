const express = require('express');
const {
  getAllRemedies,
  getRemedyById,
  getRemedyByCode,
  createRemedy,
  updateRemedy,
  deleteRemedy,
  getRemediesForSync,
  getRemedyStats
} = require('../controllers/remedyController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, remedySchemas, querySchemas } = require('../middleware/validation');

const router = express.Router();

// Public/User routes (require authentication for users)
router.get('/', authenticate, validate(querySchemas.pagination, 'query'), getAllRemedies);
router.get('/sync', authenticate, getRemediesForSync);
router.get('/code/:code', authenticate, getRemedyByCode);
router.get('/:id', authenticate, getRemedyById);

// Admin only routes
router.post('/', authenticate, requireAdmin, validate(remedySchemas.create), createRemedy);
router.put('/:id', authenticate, requireAdmin, validate(remedySchemas.update), updateRemedy);
router.delete('/:id', authenticate, requireAdmin, deleteRemedy);
router.get('/admin/stats', authenticate, requireAdmin, getRemedyStats);

module.exports = router;
