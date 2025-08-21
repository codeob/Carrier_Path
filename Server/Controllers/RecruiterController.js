const Recruiter = require('../Models/RecruiterModel');
const jwt = require('jsonwebtoken');

exports.SignupRecruiter = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : email;
    const normalizedName = typeof name === 'string' ? name.trim() : name;
    const normalizedCompany = typeof company === 'string' ? company.trim() : company;

    // Validate request
    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
    if (existingRecruiter) {
      return res.status(400).json({ message: 'Recruiter already exists' });
    }

    // Create new recruiter
    const recruiter = new Recruiter({
      name: normalizedName,
      email: normalizedEmail,
      password,
      company: normalizedCompany,
      lastActivity: new Date(), // Set lastActivity during creation
    });

    // Save recruiter (password will be hashed by pre-save hook)
    await recruiter.save();

    // Generate auth token
    const token = jwt.sign(
      { recruiterId: recruiter._id, role: 'recruiter' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Recruiter signed up successfully',
      token,
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company,
      },
    });
  } catch (error) {
    console.error('Error signing up recruiter:', error);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    if (error.name === 'MongooseError') {
      return res.status(500).json({ message: 'Database connection error', error: error.message });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.LoginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : email;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find recruiter by email
    const recruiter = await Recruiter.findOne({ email: normalizedEmail });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Check password
    const isMatch = await recruiter.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last activity timestamp
    recruiter.lastActivity = new Date();
    await recruiter.save();

    // Generate auth token
    const token = jwt.sign(
      { recruiterId: recruiter._id, role: 'recruiter' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respond with success
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
    console.error('Error logging in recruiter:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}