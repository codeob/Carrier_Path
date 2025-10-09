const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: [true, 'User ID is required'],
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  resume: {
    type: String,
    default: '',
  },
  portfolioLink: {
    type: String,
    trim: true,
  },
  githubLink: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  // ATS scanning results and standout flag
  ats: {
    overallScore: { type: Number, default: null },
    keywordMatch: { type: Number, default: null },
    structureScore: { type: Number, default: null },
    readabilityScore: { type: Number, default: null },
    standOutPoints: { type: [String], default: [] },
  },
  standout: {
    type: Boolean,
    default: false,
  },
  standoutRead: {
    type: Boolean,
    default: false,
  },
  statusRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.model('Application', applicationSchema);