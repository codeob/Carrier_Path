const express = require('express');
const router = express.Router();
const { createJob, updateJob, deleteJob, getJobs, getPublicJobs, applyJob } = require('../Controllers/JobController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'Uploads');
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
      return cb(err);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, or PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Routes
router.post('/', authMiddleware(['recruiter']), upload.single('companyImage'), createJob);
router.put('/:id', authMiddleware(['recruiter']), upload.single('companyImage'), updateJob);
router.delete('/:id', authMiddleware(['recruiter']), deleteJob);
router.get('/', authMiddleware(['recruiter']), getJobs);
router.get('/public', getPublicJobs); // No auth for public jobs
router.post('/applications', authMiddleware(['user']), upload.single('resume'), applyJob);

module.exports = router;
