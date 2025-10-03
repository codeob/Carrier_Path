const Application = require('../Models/ApplicationModel');
const Job = require('../Models/JobModel');
const Message = require('../Models/MessageModel');
const Recruiter = require('../Models/RecruiterModel');
const { scanCv } = require('../cvScanner');

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

    // Run ATS scan if resume file exists
    try {
      if (req.file) {
        const fs = require('fs');
        const path = require('path');
        const resumePath = path.join(__dirname, '../Uploads', path.basename(application.resume));
        if (fs.existsSync(resumePath)) {
          const buffer = fs.readFileSync(resumePath);
          const result = await scanCv(buffer, req.file.mimetype || 'application/pdf', job.description || '');
          // Parse numeric values from result
          const toNum = (v) => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'number') return v;
            const s = String(v).replace(/%/g, '');
            const n = parseInt(s, 10);
            return Number.isNaN(n) ? null : n;
          };
          application.ats = {
            overallScore: toNum(result.overallScore),
            keywordMatch: toNum(result.keywordMatch),
            structureScore: toNum(result.structureScore),
            readabilityScore: toNum(result.readabilityScore),
            standOutPoints: Array.isArray(result.standOutPoints) ? result.standOutPoints : [],
          };
          // Very strict thresholds and notifications
          const qualifiedMin = 79; // congrats range: 79-100
          const autoRejectMax = 60; // below 60 is auto-reject with guidance
          const score = application.ats.overallScore || 0;
          application.standout = score >= qualifiedMin;

          // Send congrats for qualified applicants
          if (score >= qualifiedMin) {
            try {
              await Message.create({
                senderModel: 'System',
                recipient: application.userId,
                recipientModel: 'JobSeeker',
                job: job._id,
                content: `🎉🚀 Congratulations! Your CV scored ${score}% for ${job.title} at ${job.companyName}. Your application stands out and has been prioritized for recruiter review.`,
                sentAt: new Date(),
              });
            } catch (e) {
              console.error('Failed to send congrats message:', e);
            }
          }

          // Auto-reject with targeted tips for low scores
          if (score < autoRejectMax) {
            application.status = 'rejected';
            try {
              const missingKw = Array.isArray(result.missingKeywords) ? result.missingKeywords.slice(0, 5) : [];
              const tips = missingKw.length
                ? `Add these keywords to your Skills and Work Experience sections where relevant: ${missingKw.join(', ')}. `
                : '';
              const guidance = `${tips}Ensure your CV includes standard sections (Summary, Work Experience, Skills, Education, Certifications), uses bullet points with measurable results (e.g., “improved X by Y%”), and is formatted with standard fonts (Arial 10–12pt) for ATS compatibility.`;
              await Message.create({
                senderModel: 'System',
                recipient: application.userId,
                recipientModel: 'JobSeeker',
                job: job._id,
                content: `⚠️ Your CV scored ${score}% for ${job.title} at ${job.companyName}. To stand out, improve: ${guidance}`,
                sentAt: new Date(),
              });
            } catch (e) {
              console.error('Failed to send improvement message:', e);
            }
          }

          await application.save();
        }
      }
    } catch (scanErr) {
      console.error('ATS scan failed:', scanErr);
    }

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

    const applications = await Application.find({ jobId: { $in: jobIds }, status: { $ne: 'rejected' } })
      .populate('jobId', 'title jobType employmentType companyName companyImage')
      .populate('userId', 'skills')
      .sort({ standout: -1, 'ats.overallScore': -1, createdAt: -1 });

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

    const prevStatus = application.status;
    application.status = status;
    await application.save();

    // Notify the job seeker when their application is accepted or rejected
    if (status === 'accepted' && prevStatus !== 'accepted') {
      try {
        const recruiterId = req.recruiter?.recruiterId;
        const recruiter = await Recruiter.findById(recruiterId).select('name company');
        if (recruiter) {
          await Message.create({
            sender: recruiterId,
            senderModel: 'Recruiter',
            recipient: application.userId,
            recipientModel: 'JobSeeker',
            job: application.jobId._id || application.jobId,
            content: `Your application for ${application.jobId.title} was accepted by ${recruiter.name} at ${recruiter.company}.`,
            sentAt: new Date(),
          });
        }
      } catch (notifyErr) {
        console.error('Failed to send acceptance notification:', notifyErr);
      }
    } else if (status === 'rejected' && prevStatus !== 'rejected') {
      try {
        const recruiterId = req.recruiter?.recruiterId;
        const recruiter = await Recruiter.findById(recruiterId).select('name company');
        await Message.create({
          sender: recruiterId,
          senderModel: 'Recruiter',
          recipient: application.userId,
          recipientModel: 'JobSeeker',
          job: application.jobId._id || application.jobId,
          content: `Your application for ${application.jobId.title} was rejected by ${recruiter?.name || 'the recruiter'} at ${recruiter?.company || application.jobId.companyName}.`,
          sentAt: new Date(),
        });
      } catch (notifyErr) {
        console.error('Failed to send rejection notification:', notifyErr);
      }
    }

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

    const job = application.jobId;
    const recruiter = await Recruiter.findById(job.postedBy).select('name company');
    const recipient = application.userId;

    await Application.deleteOne({ _id: id });
    // Notify jobseeker that their application was removed by recruiter
    try {
      await Message.create({
        sender: recruiter?._id || job.postedBy,
        senderModel: 'Recruiter',
        recipient,
        recipientModel: 'JobSeeker',
        job: job._id,
        content: `Your application for ${job.title} was removed by ${recruiter?.name || 'the recruiter'} at ${recruiter?.company || job.companyName}.`,
        sentAt: new Date(),
      });
    } catch (notifyDelErr) {
      console.error('Failed to send delete notification:', notifyDelErr);
    }
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