// Import the JobSeeker model
const JobSeeker = require('../Models/JobSeekerModel');
// Import jsonwebtoken for creating JWTs
const jwt = require('jsonwebtoken');

// Controller to handle job seeker signup
exports.SignupJobSeeker = async (req, res) => {
  try {
    // Extract name, email, password, and skills from request body
    const { name, email, password, skills } = req.body;

    // Validate that required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();

    // Check if a job seeker with the given email already exists
    const existingJobSeeker = await JobSeeker.findOne({ email: normalizedEmail });
    if (existingJobSeeker) {
      return res.status(409).json({ message: 'Job seeker with this email already exists' });
    }

    // Create a new job seeker instance
    const newJobSeeker = new JobSeeker({ name, email: normalizedEmail, password, skills: skills || [] });
    // Save the job seeker to the database
    await newJobSeeker.save();

    // Generate a JWT token with id and role
    const token = jwt.sign(
      { id: newJobSeeker._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Update the job seeker's lastActivity timestamp
    await JobSeeker.findByIdAndUpdate(newJobSeeker._id, { lastActivity: new Date() });

    // Send success response with token and job seeker details
    res.status(201).json({
      success: true,
      message: 'Job seeker signed up successfully',
      token,
      jobSeeker: {
        id: newJobSeeker._id,
        name: newJobSeeker.name,
        email: newJobSeeker.email,
        skills: newJobSeeker.skills,
      },
    });
  } catch (error) {
    // Log any errors that occur during signup
    console.error('Error signing up job seeker:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Controller to handle job seeker login
exports.LoginJobSeeker = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : email;

    // Validate that email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find job seeker by email
    const jobSeeker = await JobSeeker.findOne({ email: normalizedEmail });
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }

    // Compare provided password with stored hash
    const isMatch = await jobSeeker.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update lastActivity timestamp
    jobSeeker.lastActivity = new Date();
    await jobSeeker.save();

    // Generate a JWT token with id and role
    const token = jwt.sign(
      { id: jobSeeker._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send success response with token and job seeker details
    res.status(200).json({
      success: true,
      message: 'Job seeker logged in successfully',
      token,
      jobSeeker: {
        id: jobSeeker._id,
        name: jobSeeker.name,
        email: jobSeeker.email,
        skills: jobSeeker.skills,
      },
    });
  } catch (error) {
    // Log any errors that occur during login
    console.error('Error logging in job seeker:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Controller to handle job seeker logout
exports.LogoutJobSeeker = async (req, res) => {
  try {
    // Update the job seeker's lastActivity timestamp using id from auth middleware
    await JobSeeker.findByIdAndUpdate(req.user.id, { lastActivity: new Date() });
    // Send success response
    res.status(200).json({ message: 'Job seeker logged out successfully' });
  } catch (error) {
    // Log any errors that occur during logout
    console.error('Error logging out job seeker:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Controller to handle fetching job seeker profile
exports.getProfile = async (req, res) => {
  try {
    // Find job seeker by id from auth middleware
    const jobSeeker = await JobSeeker.findById(req.user.id).select('-password');
    // Check if job seeker exists
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }
    // Send success response with job seeker profile details
    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      jobSeeker: {
        id: jobSeeker._id,
        name: jobSeeker.name,
        email: jobSeeker.email,
        skills: jobSeeker.skills,
        createdAt: jobSeeker.createdAt,
        lastActivity: jobSeeker.lastActivity,
      },
    });
  } catch (error) {
    // Log any errors that occur during profile fetch
    console.error('Error fetching job seeker profile:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};