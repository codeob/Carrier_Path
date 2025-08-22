// Import required models
const Job = require('../Models/JobModel');
const Application = require('../Models/ApplicationModel');

// Controller to get analytics for a recruiter
exports.getAnalytics = async (req, res) => {
  try {
    // Get recruiter ID from auth middleware
    const recruiterId = req.recruiter.recruiterId;

    // Count total jobs created by the recruiter
    const totalJobs = await Job.countDocuments({ createdBy: recruiterId });
    // Count published jobs created by the recruiter
    const publishedJobs = await Job.countDocuments({ createdBy: recruiterId, status: 'published' });
    // Count draft jobs created by the recruiter
    const draftJobs = await Job.countDocuments({ createdBy: recruiterId, status: 'draft' });
    // Find applications for jobs created by the recruiter
    const applications = await Application.find({ 'jobId': { $in: await Job.find({ createdBy: recruiterId }).distinct('_id') } })
      .populate('jobId', 'title')
      .populate('userId', 'name skills');

    // Calculate application status statistics
    const applicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };

    // Aggregate application counts per job
    const jobApplicationCounts = await Application.aggregate([
      { $match: { 'jobId': { $in: await Job.find({ createdBy: recruiterId }).distinct('_id') } } },
      {
        $group: {
          _id: '$jobId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      {
        $project: {
          jobTitle: '$job.title',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Send response with analytics data
    res.json({
      jobStats: {
        totalJobs,
        publishedJobs,
        draftJobs,
      },
      applicationStats,
      topJobs: jobApplicationCounts,
    });
  } catch (error) {
    // Log any errors
    console.error('Get analytics error:', error);
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};

