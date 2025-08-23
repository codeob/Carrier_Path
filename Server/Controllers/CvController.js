// Import required models and modules
const CV = require('../Models/CvModel');
const fs = require('fs').promises;
const path = require('path');
// Controller to upload a CV
exports.uploadCV = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'CV file is required' });
    }
    // Create a new CV instance
    const cv = new CV({
      user: req.user.id, // Use job seeker ID from auth middleware
      filePath: req.file.path, // Store file path from upload middleware
    });
    // Save the CV to the database
    await cv.save();
    // Send success response
    res.status(201).json(cv);
  } catch (error) {
    // Log any errors
    console.error('Upload CV error:', error);
    // Clean up uploaded file if save fails
    if (req.file) {
      try {
        await fs.unlink(path.resolve(req.file.path));
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};
// Controller to get CVs for a job seeker
exports.getCVs = async (req, res) => {
  try {
    // Find CVs for the authenticated job seeker
    const cvs = await CV.find({ user: req.user.id });
    // Send response with CVs
    res.json(cvs);
  } catch (error) {
    // Log any errors
    console.error('Get CVs error:', error);
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};