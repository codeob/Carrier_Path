// Routes/cvScannerRoute.js
// Defines the route for CV scanning, handling file uploads and calling the scanner.

const express = require('express');
const { scanCv } = require('../cvScanner');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route for scanning CV
router.post('/scan', upload.single('cvFile'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const cvFile = req.file;

    // Validate inputs
    if (!cvFile || !jobDescription) {
      return res.status(400).json({ error: 'CV file and job description are required' });
    }

    // Call ATS scanner
    const result = await scanCv(cvFile.buffer, cvFile.mimetype, jobDescription);
    res.json(result);
  } catch (error) {
    console.error('CV Scanner error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;