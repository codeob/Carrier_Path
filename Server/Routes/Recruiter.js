const express = require('express');
const router = express.Router();
const { SignupRecruiter, LoginRecruiter } = require('../Controllers/RecruiterController');
const { protect } = require('../middleware/authMiddleware');

// Public route → Signup
router.post('/signup', SignupRecruiter);
// Public route → Login
router.post('/login', LoginRecruiter);

// Protected route → Recruiter profile
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Recruiter profile fetched successfully',
    recruiter: req.recruiter, // Recruiter info attached by middleware
  });
});

module.exports = router;