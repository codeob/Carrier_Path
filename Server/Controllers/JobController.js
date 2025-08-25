const Job = require('../Models/JobModel');
const Application = require('../Models/ApplicationModel');
const JobSeeker = require('../Models/JobSeekerModel');
const Message = require('../Models/MessageModel');
const path = require('path');
const fs = require('fs');

// Helpers to robustly parse incoming fields (string JSON, comma-separated, or already parsed)
function parseArrayField(input, fallback) {
  if (input === undefined || input === null || input === '') return fallback;
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (_) {}
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return fallback;
}

function parseObjectField(input, fallback) {
  if (input === undefined || input === null || input === '') return fallback;
  if (typeof input === 'object') return input;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch (_) {
      return fallback;
    }
  }
  return fallback;
}

async function broadcastNewJob(job) {
  try {
    const recipients = await JobSeeker.find({}, '_id');
    if (!recipients || recipients.length === 0) return;

    const loc = job && job.location
      ? `${job.location.city || 'N/A'}, ${job.location.state || 'N/A'}, ${job.location.country || 'N/A'}`
      : 'N/A';

    const messages = recipients.map(({ _id }) => ({
      senderModel: 'System',
      recipient: _id,
      recipientModel: 'JobSeeker',
      job: job._id,
      content: `New job posted: ${job.title} at ${job.companyName}. Location: ${loc}`,
      sentAt: new Date(),
    }));

    await Message.insertMany(messages);
  } catch (err) {
    console.error('Failed to broadcast new job notification:', err);
  }
}

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      yearsOfExperience,
      tools,
      requirements,
      location,
      jobType,
      employmentType,
      salary,
      companyName,
      status = 'draft',
    } = req.body;

    const jobData = {
      title,
      description,
      yearsOfExperience: Number(yearsOfExperience),
      tools: tools ? JSON.parse(tools) : [],
      requirements: requirements ? JSON.parse(requirements) : [],
      location: JSON.parse(location),
      jobType,
      employmentType,
      salary: salary ? JSON.parse(salary) : {},
      companyName,
      status,
      postedBy: req.recruiter.recruiterId,
    };

    if (req.file) {
      jobData.companyImage = `/uploads/${req.file.filename}`;
    }

    const job = new Job(jobData);
    await job.save();
    if (job.status === 'published') {
      await broadcastNewJob(job);
    }

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ message: error.message || 'Failed to create job' });
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      yearsOfExperience,
      tools,
      requirements,
      location,
      jobType,
      employmentType,
      salary,
      companyName,
      status,
    } = req.body;

    const job = await Job.findOne({ _id: id, postedBy: req.recruiter.recruiterId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const prevStatus = job.status;

    const jobData = {
      title,
      description,
      yearsOfExperience: Number(yearsOfExperience ?? job.yearsOfExperience),
      tools: parseArrayField(tools, job.tools),
      requirements: parseArrayField(requirements, job.requirements),
      location: parseObjectField(location, job.location),
      jobType: jobType ?? job.jobType,
      employmentType: employmentType ?? job.employmentType,
      salary: parseObjectField(salary, job.salary),
      companyName: companyName ?? job.companyName,
      status: status ?? job.status,
    };

    if (req.file) {
      if (job.companyImage) {
        const oldImagePath = path.join(__dirname, '..', 'Uploads', path.basename(job.companyImage));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      jobData.companyImage = `/uploads/${req.file.filename}`;
    } else {
      jobData.companyImage = job.companyImage;
    }

    Object.assign(job, jobData);
    await job.save();

    if (prevStatus !== 'published' && job.status === 'published') {
      await broadcastNewJob(job);
    }

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ message: error.message || 'Failed to update job' });
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({ _id: id, postedBy: req.recruiter.recruiterId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    if (job.companyImage) {
      const imagePath = path.join(__dirname, '..', 'Uploads', path.basename(job.companyImage));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Job.deleteOne({ _id: id });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(400).json({ message: error.message || 'Failed to delete job' });
  }
};

// Get all jobs for recruiter
exports.getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      jobType,
      employmentType,
      location,
      minSalary,
      maxSalary,
      experience,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { postedBy: req.recruiter.recruiterId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { tools: { $regex: search, $options: 'i' } },
      ];
    }

    if (jobType) query.jobType = jobType;
    if (employmentType) query.employmentType = employmentType;
    if (status && ['draft', 'published', 'archived'].includes(status)) query.status = status;
    if (location) query['location.city'] = { $regex: location, $options: 'i' };
    if (minSalary) query['salary.yearly'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.yearly'] = { ...query['salary.yearly'], $lte: Number(maxSalary) };
    if (experience) query.yearsOfExperience = { $gte: Number(experience) };

    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    res.json({ jobs, totalPages });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(400).json({ message: error.message || 'Failed to fetch jobs' });
  }
};

// Get public jobs for job seekers
exports.getPublicJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      jobType,
      employmentType,
      location,
      minSalary,
      maxSalary,
      experience,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
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

    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    res.json({ jobs, totalPages });
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    res.status(400).json({ message: error.message || 'Failed to fetch public jobs' });
  }
};

// Apply to a job
exports.applyJob = async (req, res) => {
  try {
    const { jobId, fullName, email, portfolioLink, githubLink, message } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'published') {
      return res.status(404).json({ message: 'Job not found or not available for applications' });
    }

    const applicationData = {
      jobId,
      userId: req.user.id,
      fullName,
      email,
      portfolioLink,
      githubLink,
      message,
    };

    if (req.file) {
      applicationData.resume = `/uploads/${req.file.filename}`;
    }

    const application = new Application(applicationData);
    await application.save();

    res.status(201).json(application);
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(400).json({ message: error.message || 'Failed to apply to job' });
  }
};
