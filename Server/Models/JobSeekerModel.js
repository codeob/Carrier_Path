// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');
// Import bcrypt for password hashing
const bcrypt = require('bcryptjs');
// Define the schema for the JobSeeker collection
const jobSeekerSchema = new mongoose.Schema({
  // Name field for the job seeker's full name
  name: {
    type: String, // String data type
    required: true, // Must be provided
    trim: true, // Removes leading/trailing whitespace
  },
  // Email field for the job seeker's email address
  email: {
    type: String, // String data type
    required: true, // Must be provided
    unique: true, // Ensures no duplicate emails
    lowercase: true, // Converts email to lowercase
  },
  // Password field for the job seeker's password
  password: {
    type: String, // String data type
    required: true, // Must be provided
    minlength: 6, // Minimum password length of 6 characters
  },
  // Skills field for the job seeker's skills
  skills: {
    type: [String], // Array of strings
    default: [], // Default to empty array
  },
  // CreatedAt field to track when the job seeker was created
  createdAt: {
    type: Date, // Date data type
    default: Date.now, // Sets default to current timestamp
  },
  // LastActivity field to track the job seeker's last activity
  lastActivity: {
    type: Date, // Date data type
    default: null, // Initially null until updated
  },
});
// Pre-save hook to hash the password before saving
jobSeekerSchema.pre('save', async function (next) {
  // Check if the password field has been modified
  if (this.isModified('password')) {
    // Hash the password with bcrypt using 12 salt rounds
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Proceed to the next middleware
  next();
});
// Instance method to compare a candidate password with the stored hash
jobSeekerSchema.methods.comparePassword = async function (candidatePassword) {
  // Use bcrypt to compare the provided password with the stored hash
  return bcrypt.compare(candidatePassword, this.password);
};
// Create and export the JobSeeker model
const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);
// Export the model for use in other files
module.exports = JobSeeker;