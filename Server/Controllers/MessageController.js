// Import required models
const Message = require('../Models/MessageModel');
// Controller to get messages for a user
exports.getMessages = async (req, res) => {
  try {
    // Determine the model based on user role
    const model = req.recruiter ? 'Recruiter' : 'JobSeeker';
    const id = req.recruiter ? req.recruiter.recruiterId : req.user.id;
    // Log fetching attempt
    console.log('Fetching messages for user:', id, 'role:', model);
    // Find messages for the authenticated user
    const messages = await Message.find({
      recipient: id,
      recipientModel: model,
    })
      .populate('job', 'title location createdAt')
      .populate('sender', 'name')
      .sort({ sentAt: -1 });
    // Log number of messages fetched
    console.log('Fetched messages:', messages.length);
    // Send response with messages
    res.json(messages);
  } catch (error) {
    // Log any errors
    console.error('Get messages error:', {
      message: error.message,
      stack: error.stack,
      auth: req.recruiter || req.user,
    });
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};
// Controller to mark a message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    // Get message ID from params
    const { id } = req.params;
    // Determine the model based on user role
    const model = req.recruiter ? 'Recruiter' : 'JobSeeker';
    const userId = req.recruiter ? req.recruiter.recruiterId : req.user.id;
    // Log marking attempt
    console.log('Marking message as read:', id, 'for user:', userId);
    // Find the message
    const message = await Message.findOne({
      _id: id,
      recipient: userId,
      recipientModel: model,
    });
    if (!message) {
      // Log if message not found
      console.log('Message not found or not authorized:', id);
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }
    // Mark message as read
    message.read = true;
    // Save the updated message
    await message.save();
    // Log success
    console.log('Marked message as read:', id);
    // Send response with updated message
    res.json(message);
  } catch (error) {
    // Log any errors
    console.error('Mark message as read error:', {
      message: error.message,
      stack: error.stack,
      auth: req.recruiter || req.user,
    });
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};
// Controller to delete a message
exports.deleteMessage = async (req, res) => {
  try {
    // Get message ID from params
    const { id } = req.params;
    // Determine the model based on user role
    const model = req.recruiter ? 'Recruiter' : 'JobSeeker';
    const userId = req.recruiter ? req.recruiter.recruiterId : req.user.id;
    // Log deletion attempt
    console.log('Attempting to delete message:', id, 'for user:', userId);
    // Find the message
    const message = await Message.findOne({
      _id: id,
      recipient: userId,
      recipientModel: model,
    });
    if (!message) {
      // Log if message not found
      console.log('Message not found or not authorized:', id);
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }
    // Delete the message
    await Message.deleteOne({ _id: id });
    // Log success
    console.log('Deleted message:', id);
    // Send success response
    res.status(204).send();
  } catch (error) {
    // Log any errors
    console.error('Delete message error:', {
      message: error.message,
      stack: error.stack,
      auth: req.recruiter || req.user,
    });
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};
// Controller to clear all messages for a user
exports.clearAllMessages = async (req, res) => {
  try {
    // Determine the model based on user role
    const model = req.recruiter ? 'Recruiter' : 'JobSeeker';
    const userId = req.recruiter ? req.recruiter.recruiterId : req.user.id;
    // Log clearing attempt
    console.log('Clearing all messages for user:', userId, 'role:', model);
    // Delete all messages for the user
    const result = await Message.deleteMany({
      recipient: userId,
      recipientModel: model,
    });
    // Log result
    console.log('Cleared messages:', result);
    // Send success response
    res.status(204).send();
  } catch (error) {
    // Log any errors
    console.error('Clear all messages error:', {
      message: error.message,
      stack: error.stack,
      auth: req.recruiter || req.user,
    });
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};
// Controller to get unread message count
exports.getUnreadMessageCount = async (req, res) => {
  try {
    // Determine the model based on user role
    const model = req.recruiter ? 'Recruiter' : 'JobSeeker';
    const userId = req.recruiter ? req.recruiter.recruiterId : req.user.id;
    // Log count attempt
    console.log('Fetching unread message count for user:', userId, 'role:', model);
    // Count unread messages for the user
    const count = await Message.countDocuments({
      recipient: userId,
      recipientModel: model,
      read: false,
    });
    // Log count
    console.log('Unread message count:', count);
    // Send response with count
    res.json({ count });
  } catch (error) {
    // Log any errors
    console.error('Get unread message count error:', {
      message: error.message,
      stack: error.stack,
      auth: req.recruiter || req.user,
    });
    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};