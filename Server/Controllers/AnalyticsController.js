const Application = require('../Models/ApplicationModel');
const Job = require('../Models/JobModel');

// GET /api/analytics
// Returns job statistics and application statistics for the authenticated recruiter
const getAnalytics = async (req, res) => {
  try {
    const recruiterId = req.recruiter?.recruiterId || req.user?.id;
    if (!recruiterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: recruiterId }).select('_id status title createdAt yearsOfExperience');
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

    // Recent jobs (last 5)
    const recentJobs = await Job.find({ postedBy: recruiterId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title status createdAt');

    // Top jobs by application count (limit 5)
    let topJobs = [];
    if (jobIds.length > 0) {
      const agg = await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        { $project: { jobId: '$_id', title: '$job.title', count: 1 } },
      ]);
      topJobs = agg.map((a) => ({ jobId: a.jobId, title: a.title, applicationCount: a.count }));
    }

    // Full application history (latest first, capped)
    const applicationDocs = await Application.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(200)
      .select('_id jobId fullName email createdAt status')
      .populate('jobId', 'title yearsOfExperience');

    const applicationHistory = applicationDocs.map((a) => ({
      id: a._id,
      applicantName: a.fullName || 'Applicant',
      applicantEmail: a.email || '',
      jobTitle: a.jobId?.title || 'Unknown',
      jobYearsOfExperience: a.jobId?.yearsOfExperience ?? null,
      status: a.status,
      createdAt: a.createdAt,
    }));

    // Recent application updates (by updatedAt)
    const recentApplicationUpdatesDocs = await Application.find({ jobId: { $in: jobIds } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('_id jobId status updatedAt fullName email createdAt')
      .populate('jobId', 'title');

    const recentApplicationUpdates = recentApplicationUpdatesDocs.map((a) => ({
      id: a._id,
      jobTitle: a.jobId?.title || 'Unknown',
      applicantName: a.fullName || 'Applicant',
      applicantEmail: a.email || '',
      status: a.status,
      updatedAt: a.updatedAt,
      createdAt: a.createdAt,
    }));

    // Weekly application counts for last 8 weeks (by createdAt)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    let weeklyApplicationCounts = [];
    if (jobIds.length > 0) {
      const weeklyAgg = await Application.aggregate([
        { $match: { jobId: { $in: jobIds }, createdAt: { $gte: eightWeeksAgo } } },
        { $group: { _id: { $dateTrunc: { date: '$createdAt', unit: 'week' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      weeklyApplicationCounts = weeklyAgg.map((w) => ({ weekStart: w._id, count: w.count }));
    }

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
      recentJobs,
      topJobs,
      recentApplicationUpdates,
      weeklyApplicationCounts,
      applicationHistory,
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return res.status(500).json({ message: 'Failed to compute analytics' });
  }
};

module.exports = { getAnalytics };
