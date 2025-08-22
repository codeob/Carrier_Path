// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Define the schema for the Job collection
const jobSchema = new mongoose.Schema({
  // Job title field
  title: {
    type: String, // String data type
    required: [true, 'Job title is required'], // Must be provided
    trim: true, // Removes leading/trailing whitespace
    maxlength: [100, 'Job title must be 100 characters or less'], // Max length of 100
  },
  // Job description field
  description: {
    type: String, // String data type
    required: [true, 'Job description is required'], // Must be provided
    trim: true, // Removes leading/trailing whitespace
    maxlength: [5000, 'Description must be 5000 characters or less'], // Max length of 5000
  },
  // Years of experience required
  yearsOfExperience: {
    type: Number, // Number data type
    required: [true, 'Years of experience is required'], // Must be provided
    min: [0, 'Years of experience must be 0 or greater'], // Minimum value of 0
    max: [50, 'Years of experience must be 50 or less'], // Maximum value of 50
  },
  // Tools required for the job
  tools: {
    type: [String], // Array of strings
    default: [], // Default to empty array
    validate: {
      // Validate each tool in the array
      validator: function (arr) {
        return arr.every((tool) => typeof tool === 'string' && tool.length <= 100);
      },
      message: 'Each tool must be a string with 100 characters or less', // Error message
    },
  },
  // Requirements for the job
  requirements: {
    type: [String], // Array of strings
    default: [], // Default to empty array
    validate: {
      // Validate each requirement in the array
      validator: function (arr) {
        return arr.every((req) => typeof req === 'string' && req.length <= 200);
      },
      message: 'Each requirement must be a string with 200 characters or less', // Error message
    },
  },
  // Location details for the job
  location: {
    country: { type: String, required: [true, 'Country is required'], trim: true }, // Country field
    state: { type: String, required: [true, 'State is required'], trim: true }, // State field
    city: { type: String, required: [true, 'City is required'], trim: true }, // City field
  },
  // Type of work arrangement
  jobType: {
    type: String, // String data type
    required: [true, 'Work arrangement is required'], // Must be provided
    enum: {
      values: ['remote', 'in-office', 'hybrid'], // Allowed values
      message: 'Job type must be one of: remote, in-office, hybrid', // Error message
    },
  },
  // Type of employment
  employmentType: {
    type: String, // String data type
    required: [true, 'Employment type is required'], // Must be provided
    enum: {
      values: ['full-time', 'part-time', 'contract', 'internship'], // Allowed values
      message: 'Employment type must be one of: full-time, part-time, contract, internship', // Error message
    },
  },
  // Salary details for the job
  salary: {
    hourly: { type: Number, min: [0, 'Hourly salary must be positive'], default: null }, // Hourly salary
    weekly: { type: Number, min: [0, 'Weekly salary must be positive'], default: null }, // Weekly salary
    monthly: { type: Number, min: [0, 'Monthly salary must be positive'], default: null }, // Monthly salary
    yearly: { type: Number, min: [0, 'Yearly salary must be positive'], default: null }, // Yearly salary
  },
  // Status of the job
  status: {
    type: String, // String data type
    enum: ['draft', 'published', 'archived'], // Allowed values
    default: 'draft', // Default to draft
  },
  // Reference to the recruiter who created the job
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId data type
    ref: 'Recruiter', // References Recruiter model
    required: [true, 'Creator is required'], // Must be provided
  },
  // Timestamp for job creation
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
jobSchema.pre('save', function (next) {
  this.updatedAt = Date.now(); // Set updatedAt to current timestamp
  // Validate that at least one salary field is provided
  if (!this.salary.hourly && !this.salary.weekly && !this.salary.monthly && !this.salary.yearly) {
    return next(new Error('At least one salary field (hourly, weekly, monthly, or yearly) must be provided'));
  }
  next(); // Proceed to save
});

// Create and export the Job model
module.exports = mongoose.model('Job', jobSchema);