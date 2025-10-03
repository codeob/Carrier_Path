import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonLoading, setButtonLoading] = useState({});

  const fetchNotifications = async () => {
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
  };

  useEffect(() => {
    fetchNotifications();
  }, [navigate]);

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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated on new job postings and application statuses</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchNotifications}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-t-blue-700 rounded-full"></span>
                ) : (
                  '🔄 Refresh'
                )}
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
                  disabled={buttonLoading.clearAll}
                >
                  {buttonLoading.clearAll ? (
                    <span className="animate-spin h-5 w-5 border-2 border-t-red-700 rounded-full"></span>
                  ) : (
                    '🗑️ Clear All'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12" aria-label="Loading notifications">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
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
          <div className="space-y-6">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm border ${
                  notification.read ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50'
                } p-4 sm:p-6 hover:shadow-md transition-shadow`}
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
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center gap-2 disabled:opacity-50"
                        disabled={buttonLoading[notification._id] === 'read'}
                      >
                        {buttonLoading[notification._id] === 'read' ? (
                          <span className="animate-spin h-5 w-5 border-2 border-t-white rounded-full"></span>
                        ) : (
                          'Mark as Read'
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
                      disabled={buttonLoading[notification._id] === 'delete'}
                    >
                      {buttonLoading[notification._id] === 'delete' ? (
                        <span className="animate-spin h-5 w-5 border-2 border-t-red-700 rounded-full"></span>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;