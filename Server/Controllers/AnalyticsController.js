const Application = require('../Models/ApplicationModel');
const Job = require('../Models/JobModel');

// GET /api/analytics
// Returns job statistics and application statistics for the authenticated recruiter
const getAnalytics = async (req, res) => {
  try {
    // Identify recruiter (authMiddleware(['recruiter']) should ensure this exists)
    const recruiterId = req.recruiter?.recruiterId || req.user?.id;
    if (!recruiterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: recruiterId }).select('_id status');
    const jobIds = jobs.map((j) => j._id);

    // Job stats
    const totalJobs = jobs.length;
    const publishedJobs = jobs.filter((j) => j.status === 'published').length;
    const draftJobs = jobs.filter((j) => j.status === 'draft').length;

    // Application stats across those jobs
    const [total, accepted, rejected, pending] = await Promise.all([
      Application.countDocuments({ jobId: { $in: jobIds } }),
      Application.countDocuments({ jobId: { $in: jobIds }, status: 'accepted' }),
      Application.countDocuments({ jobId: { $in: jobIds }, status: 'rejected' }),
      Application.countDocuments({ jobId: { $in: jobIds }, status: 'pending' }),
    ]);

    return res.json({
      jobStats: {
        totalJobs,
        publishedJobs,
        draftJobs,
      },
      applicationStats: {
        total,
        accepted,
        rejected,
        pending,
      },
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return res.status(500).json({ message: 'Failed to compute analytics' });
  }
};

module.exports = { getAnalytics };
