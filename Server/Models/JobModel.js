const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
  },
  tools: {
    type: [String],
    default: [],
  },
  requirements: {
    type: [String],
    default: [],
  },
  location: {
    country: { type: String, required: [true, 'Country is required'] },
    state: { type: String, required: [true, 'State is required'] },
    city: { type: String, required: [true, 'City is required'] },
  },
  jobType: {
    type: String,
    required: [true, 'Work arrangement is required'],
    enum: ['remote', 'in-office', 'hybrid'],
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship'],
  },
  salary: {
    hourly: { type: Number, min: 0 },
    weekly: { type: Number, min: 0 },
    monthly: { type: Number, min: 0 },
    yearly: { type: Number, min: 0 },
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  companyImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: [true, 'Posted by is required'],
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
jobSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.model('Job', jobSchema);