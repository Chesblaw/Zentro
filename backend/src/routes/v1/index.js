/**
 * API v1 Routes
 * Main entry point for API v1 endpoints
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('../auth');
const userRoutes = require('../users');
const newsRoutes = require('../news');
const portfolioRoutes = require('../portfolio');


// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/news', newsRoutes);
router.use('/portfolio', portfolioRoutes);

module.exports = router;