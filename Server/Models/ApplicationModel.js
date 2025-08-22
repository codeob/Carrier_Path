// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Define the schema for the Application collection
const applicationSchema = new mongoose.Schema({
  // Reference to the job being applied for
  jobId: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId data type
    ref: 'Job', // References Job model
    required: [true, 'Job ID is required'], // Must be provided
  },
  // Reference to the job seeker applying
  userId: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId data type
    ref: 'JobSeeker', // References JobSeeker model
    required: [true, 'User ID is required'], // Must be provided
  },
  // Full name of the applicant
  fullName: {
    type: String, // String data type
    required: [true, 'Full name is required'], // Must be provided
    trim: true, // Removes leading/trailing whitespace
    maxlength: [100, 'Full name must be 100 characters or less'], // Max length of 100
  },
  // Email of the applicant
  email: {
    type: String, // String data type
    required: [true, 'Email is required'], // Must be provided
    trim: true, // Removes leading/trailing whitespace
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'], // Email format validation
  },
  // File path of the resume
  resume: {
    type: String, // String data type
    required: [true, 'Resume is required'], // Must be provided
    match: [/\.pdf$/, 'Resume must be a PDF'], // Ensure file is a PDF
  },
  // Optional portfolio link
  portfolioLink: {
    type: String, // String data type
    trim: true, // Removes leading/trailing whitespace
    match: [/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/, 'Please provide a valid URL'], // URL validation
    default: null, // Default to null
  },
  // Optional GitHub link
  githubLink: {
    type: String, // String data type
    trim: true, // Removes leading/trailing whitespace
    match: [/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/, 'Please provide a valid URL'], // URL validation
    default: null, // Default to null
  },
  // Optional message from the applicant
  message: {
    type: String, // String data type
    trim: true, // Removes leading/trailing whitespace
    maxlength: [1000, 'Message must be 1000 characters or less'], // Max length of 1000
    default: '', // Default to empty string
  },
  // Status of the application
  status: {
    type: String, // String data type
    enum: ['pending', 'accepted', 'rejected'], // Allowed values
    default: 'pending', // Default to pending
  },
  // Timestamp for application creation
  createdAt: {
    type: Date, // Date data type
    default: Date.now, // Default to current timestamp
  },
  // Timestamp for last update
  updatedAt: {
    type: Date, // Date data type
    default: Date.now, // Default to current timestamp
  },
});

// Pre-save hook to update the updatedAt timestamp
applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now(); // Set updatedAt to current timestamp
  next(); // Proceed to save
});

// Create and export the Application model
module.exports = mongoose.model('Application', applicationSchema);