const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate, userSchemas, querySchemas } = require('../middleware/validation');

const router = express.Router();

// All user routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/', validate(querySchemas.pagination, 'query'), getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.post('/', validate(userSchemas.createUser), createUser);
router.put('/:id', validate(userSchemas.updateProfile), updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/deactivate', deactivateUser);
router.patch('/:id/activate', activateUser);

module.exports = router;
