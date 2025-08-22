// Import required models and middleware
const Job = require('../Models/JobModel');
const asyncHandler = require('express-async-handler');

// Controller to create a new job
const createJob = asyncHandler(async (req, res) => {
  // Extract fields from request body
  const { title, description, yearsOfExperience, tools, requirements, location, jobType, employmentType, salary, status } = req.body;

  // Create a new job instance
  const job = new Job({
    title,
    description,
    yearsOfExperience,
    tools: tools || [],
    requirements: requirements || [],
    location,
    jobType,
    employmentType,
    salary: salary || {},
    status: status || 'draft',
    createdBy: req.recruiter.recruiterId, // Use recruiter ID from auth middleware
  });

  // Save the job to the database
  const createdJob = await job.save();
  // Send success response
  res.status(201).json(createdJob);
});

// Controller to update a job
const updateJob = asyncHandler(async (req, res) => {
  // Get job ID from params
  const { id } = req.params;
  // Find the job by ID
  const job = await Job.findById(id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the authenticated recruiter created the job
  if (job.createdBy.toString() !== req.recruiter.recruiterId.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this job');
  }

  // Update only provided fields
  const updatedFields = {
    title: req.body.title ?? job.title,
    description: req.body.description ?? job.description,
    yearsOfExperience: req.body.yearsOfExperience ?? job.yearsOfExperience,
    tools: req.body.tools ?? job.tools,
    requirements: req.body.requirements ?? job.requirements,
    location: req.body.location ?? job.location,
    jobType: req.body.jobType ?? job.jobType,
    employmentType: req.body.employmentType ?? job.employmentType,
    salary: req.body.salary ?? job.salary,
    status: req.body.status ?? job.status,
    updatedAt: Date.now(),
  };

  // Update and save the job
  const updatedJob = await Job.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true });
  // Send response with updated job
  res.json(updatedJob);
});

// Controller to get all jobs for a recruiter
const getJobs = asyncHandler(async (req, res) => {
  // Find jobs created by the authenticated recruiter
  const jobs = await Job.find({ createdBy: req.recruiter.recruiterId });
  // Send response with jobs
  res.json(jobs);
});

// Controller to get public jobs
const getPublicJobs = asyncHandler(async (req, res) => {
  // Extract query parameters
  const { page = 1, limit = 10, search, jobType, employmentType, location, minSalary, maxSalary, experience, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Build query object
  const query = { status: 'published' };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { tools: { $regex: search, $options: 'i' } },
    ];
  }
  if (jobType) query.jobType = jobType;
  if (employmentType) query.employmentType = employmentType;
  if (location) query['location.city'] = { $regex: location, $options: 'i' };
  if (minSalary) query['salary.yearly'] = { $gte: Number(minSalary) };
  if (maxSalary) query['salary.yearly'] = { ...query['salary.yearly'], $lte: Number(maxSalary) };
  if (experience) query.yearsOfExperience = { $gte: Number(experience) };

  // Find jobs with pagination and sorting
  const jobs = await Job.find(query)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Count total matching jobs
  const total = await Job.countDocuments(query);
  // Send response with jobs and pagination info
  res.json({
    jobs,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// Controller to delete a job
const deleteJob = asyncHandler(async (req, res) => {
  // Get job ID from params
  const { id } = req.params;
  // Find the job by ID
  const job = await Job.findById(id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the authenticated recruiter created the job
  if (job.createdBy.toString() !== req.recruiter.recruiterId.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this job');
  }

  // Delete the job
  await Job.findByIdAndDelete(id);
  // Send success response
  res.json({ message: 'Job deleted successfully' });
});

// Export controller functions
module.exports = {
  createJob,
  updateJob,
  getJobs,
  getPublicJobs,
  deleteJob,
};