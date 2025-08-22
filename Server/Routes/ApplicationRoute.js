// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import application controller functions
const { createApplication, getApplications, updateApplication, deleteApplication } = require('../Controllers/ApplicationController');
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');
// Import multer for file uploads
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/'); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Set unique filename
  },
});
// Create multer upload instance
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Allow PDF files
    } else {
      cb(new Error('Only PDF files are allowed'), false); // Reject non-PDF files
    }
  },
});

// Protected route to create an application with resume upload, restricted to job seekers
router.post('/', authMiddleware(['user']), upload.single('resume'), createApplication);
// Protected route to get applications, restricted to recruiters
router.get('/', authMiddleware(['recruiter']), getApplications);
// Protected route to update an application, restricted to recruiters
router.put('/:id', authMiddleware(['recruiter']), updateApplication);
// Protected route to delete an application, restricted to recruiters
router.delete('/:id', authMiddleware(['recruiter']), deleteApplication);

// Export the router
module.exports = router;