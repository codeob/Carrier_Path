// Import jsonwebtoken for token verification
const jwt = require('jsonwebtoken');
// Import Recruiter and JobSeeker models
const Recruiter = require('../Models/RecruiterModel');
const JobSeeker = require('../Models/JobSeekerModel');
// Middleware to authenticate requests
const authMiddleware = (roles) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.recruiterId && !decoded.id) {
        return res.status(401).json({ message: 'Invalid token: Missing recruiterId or id' });
      }
      // Determine user type based on role
      if (decoded.role === 'recruiter') {
        // Find recruiter by ID
        const recruiter = await Recruiter.findById(decoded.recruiterId);
        if (!recruiter) {
          return res.status(401).json({ message: 'Recruiter not found' });
        }
        // Check session timeout (1 hour)
        if (recruiter.lastActivity && (Date.now() - new Date(recruiter.lastActivity).getTime()) > 3600000) {
          return res.status(401).json({ message: 'Session expired, please log in again' });
        }
        // Check if role is allowed
        if (roles && !roles.includes('recruiter')) {
          return res.status(403).json({ message: 'Access denied' });
        }
        // Attach recruiter data to request
        req.recruiter = { recruiterId: recruiter._id, role: 'recruiter' };
      } else if (decoded.role === 'user') {
        // Find job seeker by ID
        const jobSeeker = await JobSeeker.findById(decoded.id);
        if (!jobSeeker) {
          return res.status(401).json({ message: 'Job seeker not found' });
        }
        // Check session timeout (1 hour)
        if (jobSeeker.lastActivity && (Date.now() - new Date(jobSeeker.lastActivity).getTime()) > 3600000) {
          return res.status(401).json({ message: 'Session expired, please log in again' });
        }
        // Check if role is allowed
        if (roles && !roles.includes('user')) {
          return res.status(403).json({ message: 'Access denied' });
        }
        // Attach job seeker data to request
        req.user = { id: jobSeeker._id, role: 'user' };
      } else {
        return res.status(401).json({ message: 'Invalid role' });
      }
      // Update lastActivity timestamp
      if (req.recruiter) {
        await Recruiter.findByIdAndUpdate(req.recruiter.recruiterId, { lastActivity: new Date() });
      } else if (req.user) {
        await JobSeeker.findByIdAndUpdate(req.user.id, { lastActivity: new Date() });
      }
      // Proceed to next middleware
      next();
    } catch (error) {
      // Log any errors
      console.error('Authentication error:', error);
      // Send error response
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};
// Export the middleware
module.exports = authMiddleware;