// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import job controller functions
const { createJob, updateJob, getJobs, getPublicJobs, deleteJob } = require('../Controllers/JobController');
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');

// Protected route to create a job, restricted to recruiters
router.post('/', authMiddleware(['recruiter']), createJob);
// Protected route to update a job, restricted to recruiters
router.put('/:id', authMiddleware(['recruiter']), updateJob);
// Protected route to get recruiter’s jobs, restricted to recruiters
router.get('/', authMiddleware(['recruiter']), getJobs);
// Public route to get published jobs
router.get('/public', getPublicJobs);
// Protected route to delete a job, restricted to recruiters
router.delete('/:id', authMiddleware(['recruiter']), deleteJob);

// Export the router
module.exports = router;