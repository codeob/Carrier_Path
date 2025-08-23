const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../Controllers/AnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
// Routes
router.get('/', authMiddleware(['recruiter']), getAnalytics);
module.exports = router;