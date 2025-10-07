import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonLoading, setButtonLoading] = useState({});

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/user/signup');
        return;
      }

      const response = await axios.get('https://carrier-path.onrender.com/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load notifications.';
      setError(errorMsg);
      if (error.response?.status === 401) {
        navigate('/user/signup');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isJobNew = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    return Date.now() - created < 24 * 60 * 60 * 1000;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Unknown time';
    const d = new Date(ts);
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const diff = Date.now() - d.getTime();
    if (diff <= threeDaysMs) return formatDistanceToNow(d, { addSuffix: true });
    return format(d, 'EEE, MMM d, yyyy HH:mm');
  };

  const handleMarkAsRead = async (messageId) => {
    setButtonLoading((prev) => ({ ...prev, [messageId]: 'read' }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://carrier-path.onrender.com/api/messages/${messageId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map((msg) => (msg._id === messageId ? response.data : msg)));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark notification as read.');
    } finally {
      setButtonLoading((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const handleDeleteNotification = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setButtonLoading((prev) => ({ ...prev, [messageId]: 'delete' }));
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://carrier-path.onrender.com/api/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notifications.filter((msg) => msg._id !== messageId));
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete notification.');
      } finally {
        setButtonLoading((prev) => ({ ...prev, [messageId]: false }));
      }
    }
  };

  const handleClearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setButtonLoading((prev) => ({ ...prev, clearAll: true }));
      try {
        const token = localStorage.getItem('token');
        await axios.delete('https://carrier-path.onrender.com/api/messages/clear-all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications([]);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to clear all notifications.');
      } finally {
        setButtonLoading((prev) => ({ ...prev, clearAll: false }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 lg:px-8 pt-20 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Your Notifications
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stay informed about new opportunities, application updates, and important messages from employers.
          </p>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Real-time</div>
              <div className="text-gray-600">Updates</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Secure</div>
              <div className="text-gray-600">Messaging</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Instant</div>
              <div className="text-gray-600">Alerts</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Priority</div>
              <div className="text-gray-600">Sorting</div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Center</h2>
              <p className="text-gray-600">Manage your notifications and stay connected with opportunities</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={fetchNotifications}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-t-white rounded-full"></div>
                ) : (
                  '🔄 Refresh'
                )}
              </motion.button>
              {notifications.length > 0 && (
                <motion.button
                  onClick={handleClearAllNotifications}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 border-2 border-red-200 hover:border-red-300"
                  disabled={buttonLoading.clearAll}
                >
                  {buttonLoading.clearAll ? (
                    <div className="animate-spin h-5 w-5 border-2 border-t-red-700 rounded-full"></div>
                  ) : (
                    '🗑️ Clear All'
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
            aria-label="Loading notifications"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Loading your notifications...</span>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-1.1-.9-2-2-2s-2 .9-2 2v.68C6.63 5.36 5 7.92 5 11v5l-2 2v1h18v-1l-2-2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600 mb-4">You have no new notifications at this time.</p>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className={`bg-white rounded-xl shadow-lg border ${
                    notification.read ? 'border-gray-100' : 'border-green-200 bg-gradient-to-r from-green-50 to-teal-50'
                  } p-6 hover:shadow-xl transition-all duration-300`}
                >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{notification.content || 'No content'}</p>
                    {notification.job && (
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => navigate(`/jobseeker/dashboard/availableJobs?jobId=${notification.job._id}`)}
                          className="text-indigo-600 hover:underline"
                          title={`${notification.job?.location?.city || 'N/A'}, ${notification.job?.location?.state || 'N/A'}, ${notification.job?.location?.country || 'N/A'}`}
                        >
                          Job: {notification.job.title || 'Unknown'}
                        </button>
                        {isJobNew(notification.job?.createdAt) && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">NEW</span>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600 text-sm">
                      From: {notification.senderModel === 'System'
                        ? 'System'
                        : notification.senderModel === 'Recruiter'
                          ? `${notification.sender?.name || 'Unknown'}${notification.sender?.company ? ' (' + notification.sender.company + ')' : ''}`
                          : notification.sender?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-500 text-sm">{formatTimestamp(notification.sentAt)}</p>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    {!notification.read && (
                      <motion.button
                        onClick={() => handleMarkAsRead(notification._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition duration-200 flex items-center gap-2 disabled:opacity-50 shadow-md font-semibold"
                        disabled={buttonLoading[notification._id] === 'read'}
                      >
                        {buttonLoading[notification._id] === 'read' ? (
                          <div className="animate-spin h-5 w-5 border-2 border-t-white rounded-full"></div>
                        ) : (
                          '✓ Mark as Read'
                        )}
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleDeleteNotification(notification._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-6 py-3 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 border-2 border-red-200 hover:border-red-300 font-semibold"
                      disabled={buttonLoading[notification._id] === 'delete'}
                    >
                      {buttonLoading[notification._id] === 'delete' ? (
                        <div className="animate-spin h-5 w-5 border-2 border-t-red-700 rounded-full"></div>
                      ) : (
                        '🗑️ Delete'
                      )}
                    </motion.button>
                  </div>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;