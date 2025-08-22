// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');
// Import analytics controller
const { getAnalytics } = require('../Controllers/AnalyticsController');

// Protected route to get analytics, restricted to recruiters
router.get('/', authMiddleware(['recruiter']), getAnalytics);

// Export the router
module.exports = router;