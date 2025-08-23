// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');
// Define the schema for the CV collection
const cvSchema = new mongoose.Schema(
  {
    // Reference to the job seeker who owns the CV
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobSeeker',
      required: [true, 'User is required'],
    },
    // File path where the CV is stored
    filePath: {
      type: String,
      required: [true, 'CV file path is required'],
      trim: true,
    },
  },
  { timestamps: true }
);
// Create and export the CV model
module.exports = mongoose.models.CV || mongoose.model('CV', cvSchema);