import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';

// Optimized: Added debounced search and optimized pagination
const ViewPost = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    employmentType: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    experience: '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Optimized: Debounced search to reduce API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
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
        const params = {
          page: currentPage,
          limit: jobsPerPage,
          search: searchTerm,
          jobType: filters.jobType,
          employmentType: filters.employmentType,
          location: filters.location,
          minSalary: filters.minSalary,
          maxSalary: filters.maxSalary,
          experience: filters.experience,
          sortBy,
          sortOrder,
        };

        const response = await axios.get('http://localhost:5040/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` },
          params,
        });

        const fetchedJobs = Array.isArray(response.data.jobs || response.data.data || response.data) 
          ? (response.data.jobs || response.data.data || response.data) 
          : [];
        setJobs(fetchedJobs);
        setTotalPages(response.data.totalPages || Math.ceil(fetchedJobs.length / jobsPerPage));
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load jobs.');
        setJobs([]);
        if (error.response?.status === 401) {
          navigate('/recruiter/signup');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [navigate, currentPage, searchTerm, filters, sortBy, sortOrder]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split(':');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(
    job => {
      const matchesSearch =
        (!searchTerm ||
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(job.tools) && job.tools.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase()))));
      const matchesFilters =
        (!filters.jobType || job.jobType === filters.jobType) &&
        (!filters.employmentType || job.employmentType === filters.employmentType) &&
        (!filters.location || (job.location?.city || '').toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.minSalary || (job.salary?.yearly && job.salary.yearly >= parseInt(filters.minSalary))) &&
        (!filters.maxSalary || (job.salary?.yearly && job.salary.yearly <= parseInt(filters.maxSalary))) &&
        (!filters.experience || (job.yearsOfExperience !== undefined && job.yearsOfExperience >= parseInt(filters.experience)));
      return matchesSearch && matchesFilters;
    }
  ) : [];

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Posted Jobs</h1>
              <p className="text-gray-600">View and manage your job postings</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, location, or tools..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Arrangements</option>
                <option value="remote">Remote</option>
                <option value="in-office">In-Office</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="salary.yearly:desc">Salary (High to Low)</option>
                <option value="salary.yearly:asc">Salary (Low to High)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary (Yearly)</label>
              <input
                type="number"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                placeholder="e.g., 50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary (Yearly)</label>
              <input
                type="number"
                name="maxSalary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                placeholder="e.g., 100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                placeholder="e.g., 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
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

        {!isLoading && filteredJobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(val => val) ? 'Try adjusting your search or filters.' : 'No jobs available.'}
            </p>
            <p className="text-gray-600">Raw jobs fetched: {jobs.length}</p>
          </div>
        )}

        {!isLoading && filteredJobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4">
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

            {/* Optimized: Simplified pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Optimized: Added missing handleSubmitJob and handleDelete functions
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

export default ViewPost;