// Import the Recruiter model
const Recruiter = require('../Models/RecruiterModel');
// Import jsonwebtoken for creating JWTs
const jwt = require('jsonwebtoken');
// Controller to handle recruiter signup
exports.SignupRecruiter = async (req, res) => {
  try {
    // Extract name, email, password, and company from request body
    const { name, email, password, company } = req.body;
    // Validate that all required fields are provided
    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    // Check if a recruiter with the given email already exists
    const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
    if (existingRecruiter) {
      return res.status(409).json({ message: 'Recruiter with this email already exists' });
    }
    // Create a new recruiter instance
    const newRecruiter = new Recruiter({ name, email: normalizedEmail, password, company });
    // Save the recruiter to the database
    await newRecruiter.save();
    // Generate a JWT token with recruiterId and role
    const token = jwt.sign(
      { recruiterId: newRecruiter._id, role: 'recruiter' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    // Update the recruiter's lastActivity timestamp
    await Recruiter.findByIdAndUpdate(newRecruiter._id, { lastActivity: new Date() });
    // Send success response with token and recruiter details
    res.status(201).json({
      success: true,
      message: 'Recruiter signed up successfully',
      token,
      recruiter: {
        id: newRecruiter._id,
        name: newRecruiter.name,
        email: newRecruiter.email,
        company: newRecruiter.company,
      },
    });
  } catch (error) {
    // Log any errors that occur during signup
    console.error('Error signing up recruiter:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Controller to handle recruiter login
exports.LoginRecruiter = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : email;
    // Validate that email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Find recruiter by email
    const recruiter = await Recruiter.findOne({ email: normalizedEmail });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    // Compare provided password with stored hash
    const isMatch = await recruiter.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Update lastActivity timestamp
    recruiter.lastActivity = new Date();
    await recruiter.save();
    // Generate a JWT token with recruiterId and role
    const token = jwt.sign(
      { recruiterId: recruiter._id, role: 'recruiter' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    // Send success response with token and recruiter details
    res.status(200).json({
      success: true,
      message: 'Recruiter logged in successfully',
      token,
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company,
      },
    });
  } catch (error) {
    // Log any errors that occur during login
    console.error('Error logging in recruiter:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Controller to handle recruiter logout
exports.LogoutRecruiter = async (req, res) => {
  try {
    // Update the recruiter's lastActivity timestamp using recruiterId from auth middleware
    await Recruiter.findByIdAndUpdate(req.recruiter.recruiterId, { lastActivity: new Date() });
    // Send success response
    res.status(200).json({ message: 'Recruiter logged out successfully' });
  } catch (error) {
    // Log any errors that occur during logout
    console.error('Error logging out recruiter:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Controller to handle fetching recruiter profile
exports.getProfile = async (req, res) => {
  try {
    // Find recruiter by recruiterId from auth middleware
    const recruiter = await Recruiter.findById(req.recruiter.recruiterId).select('-password');
    // Check if recruiter exists
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    // Send success response with recruiter profile details
    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company,
        createdAt: recruiter.createdAt,
        lastActivity: recruiter.lastActivity,
      },
    });
  } catch (error) {
    // Log any errors that occur during profile fetch
    console.error('Error fetching recruiter profile:', error);
    // Send error response with details
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};