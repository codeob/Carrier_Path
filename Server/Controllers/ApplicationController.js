const fs = require('fs');
const path = require('path');

const Application = require('../Models/ApplicationModel');
const Job = require('../Models/JobModel');
const Message = require('../Models/MessageModel');
const Recruiter = require('../Models/RecruiterModel');
const { scanCv } = require('../cvScanner');

// Helpers
const toNum = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/%/g, '');
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
};

const normalizeStatus = (value) => {
  if (!value) return null;
  const s = String(value).trim().toLowerCase();
  if (['accept', 'accepted', 'approve', 'approved'].includes(s)) return 'accepted';
  if (['reject', 'rejected', 'decline', 'declined', 'deny', 'denied'].includes(s)) return 'rejected';
  return null;
};

const getRecruiterInfo = async (recruiterId) => {
  try {
    if (!recruiterId) return { name: 'the recruiter', company: undefined };
    const rec = await Recruiter.findById(recruiterId).select('name company');
    return { name: rec?.name || 'the recruiter', company: rec?.company };
  } catch {
    return { name: 'the recruiter', company: undefined };
  }
};

// Create a new application (Job Seeker)
exports.createApplication = async (req, res) => {
  try {
    const { jobId, fullName, email, portfolioLink, githubLink, message } = req.body;

    if (!jobId || !fullName || !email) {
      return res.status(400).json({ message: 'jobId, fullName, and email are required' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized: missing user context' });
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
      // Public URL style for client
      applicationData.resume = `/uploads/${req.file.filename}`;
    }

    const application = new Application(applicationData);
    await application.save();

    // Run ATS scan if resume file exists and scanner is available
    try {
      if (req.file && typeof scanCv === 'function') {
        const resumeFsPath = (() => {
          if (req.file?.path) {
            return path.isAbsolute(req.file.path) ? req.file.path : path.join(process.cwd(), req.file.path);
          }
          // fallback legacy path
          const base = path.basename(application.resume || '');
          return path.join(__dirname, '../Uploads', base);
        })();

        if (fs.existsSync(resumeFsPath)) {
          const buffer = fs.readFileSync(resumeFsPath);
          const result = await scanCv(buffer, req.file.mimetype || 'application/pdf', job.description || '');

          application.ats = {
            overallScore: toNum(result?.overallScore),
            keywordMatch: toNum(result?.keywordMatch),
            structureScore: toNum(result?.structureScore),
            readabilityScore: toNum(result?.readabilityScore),
            standOutPoints: Array.isArray(result?.standOutPoints) ? result.standOutPoints : [],
          };

          // Strict thresholds and notifications
          const qualifiedMin = 79;
          const autoRejectMax = 60;
          const score = application.ats.overallScore || 0;
          application.standout = score >= qualifiedMin;

          // Congrats for high score
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

          // Auto-reject for low score
          if (score < autoRejectMax) {
            application.status = 'rejected';
            try {
              const missingKw = Array.isArray(result?.missingKeywords) ? result.missingKeywords.slice(0, 5) : [];
              const tips = missingKw.length
                ? `Add these keywords to your Skills and Work Experience sections where relevant: ${missingKw.join(', ')}. `
                : '';
              const guidance = `${tips}Ensure your CV includes standard sections (Summary, Work Experience, Skills, Education, Certifications), uses bullet points with measurable results (e.g., "improved X by Y%"), and is formatted with standard fonts (Arial 10–12pt) for ATS compatibility.`;
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
        } else {
          console.warn('Resume file not found at path:', resumeFsPath);
        }
      } else if (!scanCv) {
        console.warn('scanCv is not available. Ensure ../cvScanner exports scanCv or a default function.');
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
    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized: missing requester identity' });
    }

    const jobs = await Job.find({ postedBy: requesterId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.json([]);
    }

    const applications = await Application.find({
      jobId: { $in: jobIds },
      status: { $ne: 'rejected' },
    })
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
    const rawStatus = req.body?.status;

    const normalizedStatus = normalizeStatus(rawStatus);
    if (!normalizedStatus) {
      return res.status(400).json({ message: 'Invalid status value. Use accepted or rejected.' });
    }

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const requesterId = req.recruiter?.recruiterId || req.user?.id;
    const jobOwnerId = application.jobId?.postedBy;
    if (!jobOwnerId || String(jobOwnerId) !== String(requesterId)) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    const prevStatus = application.status;
    application.status = normalizedStatus;
    await application.save();

    const recruiterId = requesterId;
    const { name: recruiterName, company: recruiterCompany } = await getRecruiterInfo(recruiterId);
    const jobRef = application.jobId._id;

    // Send notification for acceptance or rejection
    if (normalizedStatus === 'accepted' && prevStatus !== 'accepted') {
      try {
        await Message.create({
          sender: recruiterId,
          senderModel: 'Recruiter',
          recipient: application.userId,
          recipientModel: 'JobSeeker',
          job: jobRef,
          content: `🎉 Congratulations! Your application for ${application.jobId.title} has been accepted by ${recruiterName}${recruiterCompany ? ` at ${recruiterCompany}` : ''}. Great work! Now relax and get ready for the exciting opportunity ahead. 🚀`,
          sentAt: new Date(),
        });
      } catch (notifyErr) {
        console.error('Failed to send acceptance notification:', notifyErr);
      }
    } else if (normalizedStatus === 'rejected' && prevStatus !== 'rejected') {
      try {
        await Message.create({
          sender: recruiterId,
          senderModel: 'Recruiter',
          recipient: application.userId,
          recipientModel: 'JobSeeker',
          job: jobRef,
          content: `We're sorry to inform you that your application for ${application.jobId.title} was not selected by ${recruiterName}${recruiterCompany ? ` at ${recruiterCompany}` : ''}. Don't be discouraged—keep applying to other great opportunities! 💪`,
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
    if (String(application.jobId?.postedBy) !== String(requesterId)) {
      return res.status(403).json({ message: 'Unauthorized to delete this application' });
    }

    if (application.resume) {
      const resumePath = path.join(__dirname, '../Uploads', path.basename(application.resume));
      if (fs.existsSync(resumePath)) {
        try {
          fs.unlinkSync(resumePath);
        } catch (e) {
          console.warn('Failed to delete resume file:', e?.message);
        }
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
        content: `Your application for ${job.title} was removed by ${recruiter?.name || 'the recruiter'}${recruiter?.company ? ` at ${recruiter.company}` : ''}.`,
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

// Clear all applications for the recruiter
exports.clearAllApplications = async (req, res) => {
  try {
    const requesterId = req.recruiter?.recruiterId || req.user?.id;
    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized: missing requester identity' });
    }

    const jobs = await Job.find({ postedBy: requesterId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.json({ message: 'No applications to delete' });
    }

    // Delete all applications for these jobs
    const result = await Application.deleteMany({ jobId: { $in: jobIds } });

    res.json({ message: `${result.deletedCount} applications deleted successfully` });
  } catch (error) {
    console.error('Error clearing applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark applications as read (placeholder; implement if schema has 'read' flag)
exports.markApplicationsAsRead = async (req, res) => {
  try {
    res.json({ message: 'Mark as read processed' });
  } catch (error) {
    console.error('Error marking applications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};