// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');
// Import CV controller functions
const { uploadCV, getCVs } = require('../Controllers/CvController');
// Import multer for file uploads
const multer = require('multer');
// Import path for file handling
const path = require('path');
// Set upload directory
const uploadDir = path.join(__dirname, '../Uploads');
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Saving file to: ${uploadDir}`);
    cb(null, uploadDir); // Set upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Set unique filename
  }
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
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});
// Protected route to upload a CV, restricted to job seekers
router.post('/', authMiddleware(['user']), upload.single('cv'), uploadCV);
// Protected route to get CVs, restricted to job seekers
router.get('/', authMiddleware(['user']), getCVs);
// Export the router
module.exports = router;