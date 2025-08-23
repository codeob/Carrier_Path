// Load environment variables from .env file
require('dotenv').config();
// Import express for creating the server
const express = require('express');
// Import body-parser for parsing JSON bodies
const bodyParser = require('body-parser');
// Import cors for enabling cross-origin requests
const cors = require('cors');
// Import morgan for logging HTTP requests
const morgan = require('morgan');
// Import route modules
const recruiterRoutes = require('./Routes/Recruiter');
const jobSeekerRoutes = require('./Routes/JobSeekerRoute');
const jobRoutes = require('./Routes/JobRoute');
const applicationRoutes = require('./Routes/ApplicationRoute');
const cvRoutes = require('./Routes/CvRoute');
const messageRoutes = require('./Routes/MessageRoute');
const analyticsRoutes = require('./Routes/AnalyticsRoute');
// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');
// Import path for handling file paths
const path = require('path');
// Create express app
const app = express();
// Set port from environment variable or default to 5040
const PORT = process.env.PORT || 5040;
// Enable CORS for frontend (adjust origin as needed)
app.use(cors());
// Parse JSON bodies
app.use(express.json());
// Parse JSON bodies with body-parser
app.use(bodyParser.json());
// Log HTTP requests in development mode
app.use(morgan('dev'));
// Serve static files from Uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Server!');
});
// Mount routes
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/jobseeker', jobSeekerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });