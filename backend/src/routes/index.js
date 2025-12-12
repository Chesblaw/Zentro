
/**
 * API Routes Index
 * Provides API versioning support with backward compatibility
 */
const express = require('express');
const router = express.Router();

// Version-specific routes
router.use('/v1', require('./v1'));

module.exports = router;
