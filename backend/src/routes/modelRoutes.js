const express = require('express');
const multer = require('multer');
const {
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
} = require('../controllers/modelController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, modelSchemas, querySchemas } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// Public routes (no authentication required for model downloads)
router.get('/active', optionalAuth, getActiveModel);
router.get('/default', optionalAuth, getDefaultModel);
router.get('/updates', optionalAuth, checkModelUpdates);
router.get('/:id/download', downloadModel);

// Protected routes (require authentication)
router.get('/', authenticate, validate(querySchemas.pagination, 'query'), getAllModels);
router.get('/:id', authenticate, getModelById);

// Admin only routes
router.post('/', authenticate, requireAdmin, validate(modelSchemas.create), createModel);
router.put('/:id', authenticate, requireAdmin, validate(modelSchemas.update), updateModel);
router.post('/:id/upload', authenticate, requireAdmin, upload.single('modelFile'), uploadModelFiles);
router.patch('/:id/activate', authenticate, requireAdmin, activateModel);
router.patch('/:id/deactivate', authenticate, requireAdmin, deactivateModel);
router.patch('/:id/set-default', authenticate, requireAdmin, setDefaultModel);
router.delete('/:id', authenticate, requireAdmin, deleteModel);

module.exports = router;
