import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTools, FaFileAlt } from 'react-icons/fa';

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/recruiter/auth');
          return;
        }

        const response = await axios.get('http://localhost:5040/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setApplications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError(error.response?.data?.message || 'Failed to load applications. Please try again.');
        if (error.response?.status === 401) {
          navigate('/recruiter/auth');
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
        `http://localhost:5040/api/applications/${applicationId}`,
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
        await axios.delete(`http://localhost:5040/api/applications/${applicationId}`, {
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
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="p-4 sm:p-6 mb-6 border border-gray-200 rounded-lg bg-white">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-600">Manage applications for your job postings</p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
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

        {!isLoading && applications.length === 0 && (
          <div className="border border-gray-200 rounded-lg p-8 sm:p-12 text-center bg-white">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">No job seekers have applied to your postings yet.</p>
          </div>
        )}

        {!isLoading && applications.length > 0 && (
          <div className="flex flex-wrap gap-6 justify-center">
            {applications.map((app) => (
              <div key={app._id} className="border border-gray-200 rounded-lg p-4 sm:p-6 max-w-3xl w-full sm:w-3/4 md:w-2/3 lg:w-1/2 bg-white">
                <div className="flex flex-col items-start mb-4">
                  <div className="mb-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{app.jobId?.title || 'Unknown Job'}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">Applicant: {app.fullName}</p>
                <p className="text-gray-600 mb-4">Email: {app.email}</p>
                <div className="space-y-2 mb-4">
                  {app.jobId && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-gray-600">
                        <span className="text-gray-400 text-sm">🏢</span>
                        <span className="text-sm font-medium">Work Arrangement: </span>
                        <span className="text-sm">{app.jobId.jobType ? (app.jobId.jobType.charAt(0).toUpperCase() + app.jobId.jobType.slice(1).replace(/-/g, ' ')) : 'N/A'}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-gray-600">
                        <span className="text-gray-400 text-sm">💼</span>
                        <span className="text-sm font-medium">Employment Type: </span>
                        <span className="text-sm">{app.jobId.employmentType ? (app.jobId.employmentType.charAt(0).toUpperCase() + app.jobId.employmentType.slice(1).replace(/-/g, ' ')) : 'N/A'}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <FaTools className="text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(app.userId?.skills) && app.userId.skills.length > 0 ? (
                        <>
                          {app.userId.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.userId.skills.length > 3 && (
                            <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2 py-1 rounded border border-gray-200">
                              +{app.userId.skills.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm">No skills specified</span>
                      )}
                    </div>
                  </div>
                  {app.resume && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaFileAlt className="text-gray-400" />
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                  {app.portfolioLink && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">🌐</span>
                      <a
                        href={app.portfolioLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Portfolio
                      </a>
                    </div>
                  )}
                  {app.githubLink && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">💻</span>
                      <a
                        href={app.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View GitHub
                      </a>
                    </div>
                  )}
                  {app.message && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Cover Letter</h3>
                      <p className="text-gray-600 text-sm">{app.message}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(app._id, 'accepted')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                    disabled={app.status === 'accepted'}
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'rejected')}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                    disabled={app.status === 'rejected'}
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'pending')}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                    disabled={app.status === 'pending'}
                  >
                    ⏳ Pending
                  </button>
                  <button
                    onClick={() => handleDelete(app._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;