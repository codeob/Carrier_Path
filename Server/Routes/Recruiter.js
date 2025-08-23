// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import recruiter controller functions
const { SignupRecruiter, LoginRecruiter, LogoutRecruiter, getProfile } = require('../Controllers/RecruiterController');
// Import authentication middleware
const auth = require('../middleware/authMiddleware');
// Public route for recruiter signup
router.post('/signup', SignupRecruiter);
// Public route for recruiter login
router.post('/login', LoginRecruiter);
// Protected route for recruiter logout, restricted to 'recruiter' role
router.post('/logout', auth(['recruiter']), LogoutRecruiter);
// Protected route to get recruiter profile, restricted to 'recruiter' role
router.get('/profile', auth(['recruiter']), getProfile);
// Export the router for use in the main app
module.exports = router;