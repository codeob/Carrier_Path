// Import required models and middleware
const Application = require('../Models/ApplicationModel');
const Job = require('../Models/JobModel');
const asyncHandler = require('express-async-handler');

// Controller to create a new application
const createApplication = asyncHandler(async (req, res) => {
  // Extract fields from request body
  const { jobId, fullName, email, message, portfolioLink, githubLink } = req.body;

  // Check if resume file is provided
  if (!req.file) {
    res.status(400);
    throw new Error('Resume is required');
  }

  // Find the job by ID
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job is published
  if (job.status !== 'published') {
    res.status(400);
    throw new Error('Cannot apply to unpublished job');
  }

  // Create a new application instance
  const application = new Application({
    jobId,
    userId: req.user.id, // Use job seeker ID from auth middleware
    fullName,
    email,
    resume: req.file.path, // Store file path from upload middleware
    portfolioLink: portfolioLink || null,
    githubLink: githubLink || null,
    message: message || '',
    status: 'pending',
  });

  // Save the application to the database
  const createdApplication = await application.save();
  // Send success response
  res.status(201).json(createdApplication);
});

// Controller to get applications for a recruiter
const getApplications = asyncHandler(async (req, res) => {
  // Find jobs created by the recruiter
  const jobs = await Job.find({ createdBy: req.recruiter.recruiterId }).select('_id');
  const jobIds = jobs.map(job => job._id);
  // Find applications for those jobs
  const applications = await Application.find({ jobId: { $in: jobIds } })
    .populate('jobId', 'title')
    .populate('userId', 'name email skills');
  // Send response with applications
  res.json(applications);
});

// Controller to update application status
const updateApplication = asyncHandler(async (req, res) => {
  // Get application ID from params
  const { id } = req.params;
  // Get status from request body
  const { status } = req.body;

  // Find the application by ID
  const application = await Application.findById(id);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Find the associated job
  const job = await Job.findById(application.jobId);
  if (!job || job.createdBy.toString() !== req.recruiter.recruiterId.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this application');
  }

  // Update application status and timestamp
  application.status = status;
  application.updatedAt = Date.now();
  // Save the updated application
  const updatedApplication = await application.save();
  // Send response with updated application
  res.json(updatedApplication);
});

// Controller to delete an application
const deleteApplication = asyncHandler(async (req, res) => {
  // Get application ID from params
  const { id } = req.params;
  // Find the application by ID
  const application = await Application.findById(id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Find the associated job
  const job = await Job.findById(application.jobId);
  if (!job || job.createdBy.toString() !== req.recruiter.recruiterId.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this application');
  }

  // Delete the application
  await Application.findByIdAndDelete(id);
  // Send success response
  res.json({ message: 'Application deleted successfully' });
});

// Export controller functions
module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
};