// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import job seeker controller functions
const { SignupJobSeeker, LoginJobSeeker, LogoutJobSeeker, getProfile } = require('../Controllers/JobSeekerControllers');
// Import authentication middleware
const auth = require('../middleware/authMiddleware');
// Public route for job seeker signup
router.post('/signup', SignupJobSeeker);
// Public route for job seeker login
router.post('/login', LoginJobSeeker);
// Protected route for job seeker logout, restricted to 'user' role
router.post('/logout', auth(['user']), LogoutJobSeeker);
// Protected route to get job seeker profile, restricted to 'user' role
router.get('/profile', auth(['user']), getProfile);
// Export the router for use in the main app
module.exports = router;