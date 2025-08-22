import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';

// Optimized: Added debounced search to reduce API calls
const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Optimized: Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/recruiter/signup');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5040/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { search: searchTerm, status: filter === 'all' ? undefined : filter },
        });

        setJobs(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load jobs.');
        if (error.response?.status === 401) {
          navigate('/recruiter/signup');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [navigate, searchTerm, filter]);

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5040/api/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete job.');
      }
    }
  };

  const handleSubmitJob = async (jobId, status) => {
    try {
      const token = localStorage.getItem('token');
      const job = jobs.find(job => job._id === jobId);
      if (!job) {
        setError('Job not found.');
        return;
      }

      const updatedJobData = {
        ...job,
        status,
        title: job.title,
        description: job.description,
        yearsOfExperience: job.yearsOfExperience,
        tools: job.tools || [],
        requirements: job.requirements || [],
        location: job.location || { country: '', state: '', city: '' },
        jobType: job.jobType || 'remote',
        employmentType: job.employmentType || 'full-time',
        salary: job.salary || {},
      };

      const response = await axios.put(
        `http://localhost:5040/api/jobs/${jobId}`,
        updatedJobData,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      setJobs(jobs.map(job => (job._id === jobId ? response.data : job)));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update job status.');
      if (error.response?.status === 401) {
        navigate('/recruiter/auth');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatSalary = (salary) => {
    const salaryTypes = [
      { key: 'hourly', label: '/hour' },
      { key: 'weekly', label: '/week' },
      { key: 'monthly', label: '/month' },
      { key: 'yearly', label: '/year' },
    ];
    const availableSalaries = salaryTypes
      .filter(type => salary?.[type.key])
      .map(type => `$${salary[type.key].toLocaleString()}${type.label}`);
    return availableSalaries.length > 0 ? availableSalaries.join(', ') : 'Not specified';
  };

  const formatField = (value) => {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ') : 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
              <p className="text-gray-600">Manage your job listings and track their status</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => navigate('/recruiter/dashboard/CreateJobs')}
                className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center gap-2"
              >
                <span>+</span>
                Create New Job
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, location, or tools..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              >
                <option value="all">All Jobs</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
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

        {!isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Get started by creating your first job listing.'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => navigate('/recruiter/dashboard/CreateJobs')}
                className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Create Your First Job
              </button>
            )}
          </div>
        )}

        {!isLoading && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4 max-w-md">
                <div className="flex flex-col items-start mb-2">
                  <div className="mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Description</h3>
                    <p className="text-gray-600 text-sm">{job.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">📍</span>
                    <span className="text-sm">{job.location?.city || 'N/A'}, {job.location?.state || 'N/A'}, {job.location?.country || 'N/A'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">🏢</span>
                    <span className="text-sm font-medium">Work Arrangement: </span>
                    <span className="text-sm">{formatField(job.jobType)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">💼</span>
                    <span className="text-sm font-medium">Employment Type: </span>
                    <span className="text-sm">{formatField(job.employmentType)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">⏱️</span>
                    <span className="text-sm font-medium">Experience: </span>
                    <span className="text-sm">{job.yearsOfExperience !== undefined ? `${job.yearsOfExperience} years` : 'Not specified'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">💰</span>
                    <span className="text-sm font-medium">Salary: </span>
                    <span className="text-sm">{formatSalary(job.salary)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">🛠️</span>
                    <span className="text-sm font-medium">Tools: </span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(job.tools) && job.tools.length > 0 ? (
                        job.tools.map((tool, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 text-xs font-medium px-1 py-0.5 rounded border border-blue-200"
                          >
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm">No tools specified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Requirements</h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                        job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-600">No requirements specified</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/recruiter/dashboard/CreateJobs', { state: { job } })}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-2 rounded-md transition duration-200 flex items-center gap-1 text-sm"
                  >
                    <span>✏️</span>
                    Edit
                  </button>
                  {job.status !== 'published' && (
                    <button
                      onClick={() => handleSubmitJob(job._id, 'published')}
                      className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-1 px-2 rounded-md transition duration-200 flex items-center gap-1 text-sm"
                    >
                      <span>✅</span>
                      Publish
                    </button>
                  )}
                  {job.status !== 'archived' && (
                    <button
                      onClick={() => handleSubmitJob(job._id, 'archived')}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-1 px-2 rounded-md transition duration-200 flex items-center gap-1 text-sm"
                    >
                      <span>🗄️</span>
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-1 px-2 rounded-md transition duration-200 flex items-center gap-1 text-sm"
                  >
                    <span>🗑️</span>
                    Delete
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

export default JobList;