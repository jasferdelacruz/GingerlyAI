const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const remedyRoutes = require('./remedyRoutes');
const predictionRoutes = require('./predictionRoutes');
const modelRoutes = require('./modelRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GingerlyAI Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/remedies', remedyRoutes);
router.use('/predictions', predictionRoutes);
router.use('/models', modelRoutes);

module.exports = router;
