const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Recruiter Schema
const recruiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes unnecessary spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate emails
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforce stronger password
  },
  company: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: null,
  },
});

// Hash password before saving recruiter
recruiterSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare candidate password with the stored hash
recruiterSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
module.exports = Recruiter;
