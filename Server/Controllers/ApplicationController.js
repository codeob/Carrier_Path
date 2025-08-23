const Application = require('../Models/ApplicationModel');
const Job = require('../Models/JobModel');

// Create a new application (Job Seeker)
exports.createApplication = async (req, res) => {
  try {
    const { jobId, fullName, email, portfolioLink, githubLink, message } = req.body;

    if (!jobId || !fullName || !email) {
      return res.status(400).json({ message: 'jobId, fullName, and email are required' });
    }

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'published') {
      return res.status(404).json({ message: 'Job not found or not available for applications' });
    }

    const existing = await Application.findOne({ jobId, userId: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this job' });
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

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title jobType employmentType companyName companyImage')
      .populate('userId', 'skills');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(400).json({ message: error.message || 'Failed to create application' });
  }
};

// Get all applications for the recruiter's jobs
exports.getApplications = async (req, res) => {
  try {
    const requesterId = req.recruiter?.recruiterId || req.user?.id;
    const jobs = await Job.find({ postedBy: requesterId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title jobType employmentType companyName companyImage')
      .populate('userId', 'skills');

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(400).json({ message: error.message || 'Failed to fetch applications' });
  }
};

// Update application status
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const requesterId = req.recruiter?.recruiterId || req.user?.id;
    if (application.jobId.postedBy.toString() !== String(requesterId)) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    application.status = status;
    await application.save();

    const updatedApplication = await Application.findById(id)
      .populate('jobId', 'title jobType employmentType companyName companyImage')
      .populate('userId', 'skills');

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(400).json({ message: error.message || 'Failed to update application status' });
  }
};

// Delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const requesterId = req.recruiter?.recruiterId || req.user?.id;
    if (application.jobId.postedBy.toString() !== String(requesterId)) {
      return res.status(403).json({ message: 'Unauthorized to delete this application' });
    }

    if (application.resume) {
      const fs = require('fs');
      const path = require('path');
      const resumePath = path.join(__dirname, '../Uploads', path.basename(application.resume));
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }

    await Application.deleteOne({ _id: id });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(400).json({ message: error.message || 'Failed to delete application' });
  }
};

// Mark applications as read (no-op if schema lacks a 'read' flag)
exports.markApplicationsAsRead = async (req, res) => {
  try {
    res.json({ message: 'Mark as read processed' });
  } catch (error) {
    console.error('Error marking applications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
