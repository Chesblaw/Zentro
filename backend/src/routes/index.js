
/**
 * API Routes Index
 * Provides API versioning support with backward compatibility
 */
const express = require('express');
const router = express.Router();

// Documentation routes (no version handling for docs)
router.use('/docs', require('./docs'));

// API versioning middleware
router.use(versionHandler);

// Version-specific routes
router.use('/v1', require('./v1'));
router.use('/v2', require('./v2'));

// Default to latest version for unversioned routes
router.use('/', require(`./${getLatestVersion()}`));

module.exports = router;
