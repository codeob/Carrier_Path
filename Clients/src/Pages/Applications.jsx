import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTools, FaFileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/recruiter/signup');
          return;
        }

        const response = await axios.get('https://carrier-path.onrender.com/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setApplications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError(error.response?.data?.message || 'Failed to load applications. Please try again.');
        if (error.response?.status === 401) {
          navigate('/recruiter/signup');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const handleStatusChange = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://carrier-path.onrender.com/api/applications/${applicationId}`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setApplications(
        applications.map(app => (app._id === applicationId ? response.data : app))
      );
    } catch (error) {
      console.error('Error updating application status:', error);
      setError(error.response?.data?.message || 'Failed to update application status.');
    }
  };

  const handleDelete = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://carrier-path.onrender.com/api/applications/${applicationId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setApplications(applications.filter(app => app._id !== applicationId));
      } catch (error) {
        console.error('Error deleting application:', error);
        setError(error.response?.data?.message || 'Failed to delete application.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-50 to-emerald-50"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="p-6 sm:p-8 mb-8 border border-slate-200 rounded-2xl bg-white shadow-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Applications</h1>
                <p className="text-slate-600 text-base">Manage applications for your job postings</p>
              </div>
            </div>
            {applications.length > 0 && (
              <button
                onClick={async () => {
                  if (!window.confirm('Delete ALL applications for your jobs? This cannot be undone.')) return;
                  try {
                    setBulkDeleting(true);
                    const token = localStorage.getItem('token');
                    await axios.delete('https://carrier-path.onrender.com/api/applications/clear-all', {
                      headers: { 'Authorization': `Bearer ${token}` },
                    });
                    setApplications([]);
                  } catch (err) {
                    console.error('Error clearing applications:', err);
                    setError(err.response?.data?.message || 'Failed to delete all applications.');
                  } finally {
                    setBulkDeleting(false);
                  }
                }}
                disabled={bulkDeleting}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {bulkDeleting ? (
                  <span className="animate-spin h-5 w-5 border-2 border-t-red-700 rounded-full"></span>
                ) : (
                  '🗑️ Delete All'
                )}
              </button>
            )}
          </div>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && applications.length === 0 && (
          <div className="border border-slate-200 rounded-2xl p-12 sm:p-16 text-center bg-white shadow-xl">
            <div className="w-32 h-32 mx-auto mb-6 text-slate-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No applications found</h3>
            <p className="text-slate-600 text-lg mb-6">No job seekers have applied to your postings yet.</p>
          </div>
        )}

        {!isLoading && applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className="border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full sm:w-3/4 md:w-2/3 lg:w-1/2 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-start mb-6">
                  <div className="mb-3 w-full flex items-start justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{app.jobId?.title || 'Unknown Job'}</h2>
                      <p className="text-slate-600 font-medium">Applicant: {app.fullName}</p>
                      <p className="text-slate-600">Email: {app.email}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  {app.jobId && (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Job Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="text-emerald-500 text-sm">🏢</span>
                          <span className="text-sm font-medium">Work Arrangement:</span>
                          <span className="text-sm">{app.jobId.jobType ? (app.jobId.jobType.charAt(0).toUpperCase() + app.jobId.jobType.slice(1).replace(/-/g, ' ')) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="text-emerald-500 text-sm">💼</span>
                          <span className="text-sm font-medium">Employment Type:</span>
                          <span className="text-sm">{app.jobId.employmentType ? (app.jobId.employmentType.charAt(0).toUpperCase() + app.jobId.employmentType.slice(1).replace(/-/g, ' ')) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Applicant Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(app.userId?.skills) && app.userId.skills.length > 0 ? (
                        <>
                          {app.userId.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-lg border border-emerald-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.userId.skills.length > 5 && (
                            <span className="bg-slate-50 text-slate-600 text-xs font-medium px-3 py-1 rounded-lg border border-slate-200">
                              +{app.userId.skills.length - 5} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">No skills specified</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {app.resume && (
                      <button
                        onClick={() => {
                          setSelectedResume(app.resume);
                          setModalOpen(true);
                        }}
                        className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200 hover:shadow-md"
                      >
                        <FaFileAlt className="text-blue-500 text-lg" />
                        <div className="text-left">
                          <span className="text-blue-700 font-medium block">View Resume</span>
                          <span className="text-blue-600 text-sm">Click to preview</span>
                        </div>
                      </button>
                    )}
                    {app.portfolioLink && (
                      <a
                        href={app.portfolioLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 border border-purple-200 hover:shadow-md"
                      >
                        <span className="text-purple-500 text-lg">🌐</span>
                        <div className="text-left">
                          <span className="text-purple-700 font-medium block">View Portfolio</span>
                          <span className="text-purple-600 text-sm">External link</span>
                        </div>
                      </a>
                    )}
                    {app.githubLink && (
                      <a
                        href={app.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:shadow-md"
                      >
                        <span className="text-gray-500 text-lg">💻</span>
                        <div className="text-left">
                          <span className="text-gray-700 font-medium block">View GitHub</span>
                          <span className="text-gray-600 text-sm">External link</span>
                        </div>
                      </a>
                    )}
                  </div>
                  {app.ats && app.ats.overallScore !== null && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-500 text-sm">📊</span>
                      <span className="text-green-700 font-medium">ATS Score: {app.ats.overallScore}%</span>
                    </div>
                  )}
                  {app.message && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Cover Letter</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{app.message}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(app._id, 'accepted')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(app._id, 'rejected')}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(app._id, 'pending')}
                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                        disabled={app.status === 'pending'}
                      >
                        ⏳ Pending
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(app._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Resume Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Resume Preview</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <iframe
                  src={selectedResume}
                  className="w-full h-[70vh] border border-slate-200 rounded-lg"
                  title="Resume Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Applications;
