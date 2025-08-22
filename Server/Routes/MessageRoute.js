// Import express to create a router
const express = require('express');
// Create an instance of express Router
const router = express.Router();
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');
// Import message controller functions
const {
  getMessages,
  markMessageAsRead,
  deleteMessage,
  clearAllMessages,
  getUnreadMessageCount,
} = require('../Controllers/MessageController');

// Protected route to get messages, restricted to recruiters and job seekers
router.get('/', authMiddleware(['user', 'recruiter']), getMessages);
// Protected route to mark a message as read, restricted to recruiters and job seekers
router.put('/:id/read', authMiddleware(['user', 'recruiter']), markMessageAsRead);
// Protected route to delete a message, restricted to recruiters and job seekers
router.delete('/:id', authMiddleware(['user', 'recruiter']), deleteMessage);
// Protected route to clear all messages, restricted to recruiters and job seekers
router.delete('/clear-all', authMiddleware(['user', 'recruiter']), clearAllMessages);
// Protected route to get unread message count, restricted to recruiters and job seekers
router.get('/unread-count', authMiddleware(['user', 'recruiter']), getUnreadMessageCount);

// Export the router
module.exports = router;