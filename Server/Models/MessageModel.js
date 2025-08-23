// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');
// Define the schema for the Message collection
const messageSchema = new mongoose.Schema({
  // Sender of the message
  sender: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId data type
    refPath: 'senderModel', // Dynamic reference based on senderModel
    required: function() { return this.senderModel !== 'System'; }, // Required unless sender is System
  },
  // Model type of the sender
  senderModel: {
    type: String, // String data type
    required: true, // Must be provided
    enum: ['Recruiter', 'System', 'JobSeeker'], // Allowed values
  },
  // Recipient of the message
  recipient: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId data type
    refPath: 'recipientModel', // Dynamic reference based on recipientModel
    required: true, // Must be provided
  },
  // Model type of the recipient
  recipientModel: {
    type: String, // String data type
    required: true, // Must be provided
    enum: ['Recruiter', 'JobSeeker'], // Allowed values
  },
  // Associated job for the message
  job: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId data type
    ref: 'Job', // References Job model
    required: function() { return this.senderModel !== 'System'; }, // Required for non-system messages
  },
  // Content of the message
  content: {
    type: String, // String data type
    required: true, // Must be provided
    trim: true, // Removes leading/trailing whitespace
  },
  // Timestamp for when the message was sent
  sentAt: {
    type: Date, // Date data type
    default: Date.now, // Default to current timestamp
  },
  // Read status of the message
  read: {
    type: Boolean, // Boolean data type
    default: false, // Default to unread
  },
});
// Create and export the Message model
module.exports = mongoose.model('Message', messageSchema);