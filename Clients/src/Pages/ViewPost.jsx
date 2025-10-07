import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';

const ViewPost = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
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
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;

  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/recruiter/auth');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get('https://carrier-path.onrender.com/api/jobs', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: jobsPerPage,
            search: filters.search,
            jobType: filters.jobType,
            employmentType: filters.employmentType,
            location: filters.location,
            minSalary: filters.minSalary,
            maxSalary: filters.maxSalary,
            experience: filters.experience,
            sortBy,
            sortOrder,
          },
        });

        const fetchedJobs = Array.isArray(response.data.jobs || response.data.data || response.data)
          ? (response.data.jobs || response.data.data || response.data)
          : [];
        setJobs(fetchedJobs);
        setTotalPages(response.data.totalPages || Math.ceil(fetchedJobs.length / jobsPerPage));
      } catch (error) {
        setJobs([]);
        if (error.response?.status === 401) {
          navigate('/recruiter/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [navigate, currentPage, filters, sortBy, sortOrder]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (['minSalary', 'maxSalary', 'experience'].includes(name) && value < 0) return;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split(':');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    const salaryTypes = [
      { key: 'hourly', label: '/hour' },
      { key: 'weekly', label: '/week' },
      { key: 'monthly', label: '/month' },
      { key: 'yearly', label: '/year' },
    ];
    const availableSalaries = salaryTypes
      .filter((type) => salary?.[type.key])
      .map((type) => `$${Number(salary[type.key]).toLocaleString()}${type.label}`);
    return availableSalaries.length > 0 ? availableSalaries.join(', ') : 'Not specified';
  };

  const formatField = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ') : 'N/A');

  const isJobNew = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    return Date.now() - created < 24 * 60 * 60 * 1000;
  };

  const formatPostedTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const diff = Date.now() - d.getTime();
    if (diff <= threeDaysMs) return `Posted ${formatDistanceToNow(d, { addSuffix: true })}`;
    return `Posted ${format(d, 'EEE, MMM d, yyyy HH:mm')}`;
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-6 pt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Your Posted Jobs</h1>
              <p className="text-gray-600 text-lg">Manage and view your job postings with ease.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/recruiter/dashboard/CreateJob')}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-teal-700 transition duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">+</span>
              Create New Job
            </motion.button>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter & Search Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Title, company, tools..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
              >
                <option value="">All Types</option>
                {['remote', 'in-office', 'hybrid'].map((type) => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
              >
                <option value="">All Types</option>
                {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="City or country"
              />
            </div>
            {/* Min Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary (Yearly)</label>
              <input
                name="minSalary"
                type="number"
                min="0"
                value={filters.minSalary}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="0"
              />
            </div>
            {/* Max Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary (Yearly)</label>
              <input
                name="maxSalary"
                type="number"
                min="0"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="0"
              />
            </div>
            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (Years)</label>
              <input
                name="experience"
                type="number"
                min="0"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="0"
              />
            </div>
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="salary.yearly:desc">Salary: High to Low</option>
                <option value="salary.yearly:asc">Salary: Low to High</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-16"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
          </motion.div>
        )}

        {/* No Jobs */}
        {!isLoading && jobs.length === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Jobs Found</h3>
            <p className="text-gray-600 text-lg">
              {filters.search || Object.values(filters).some((val) => val) ? 'Try adjusting your filters.' : 'Start by creating your first job posting.'}
            </p>
          </motion.div>
        )}

        {/* Jobs Grid */}
        {!isLoading && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 gap-8"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 w-full"
              >
                <div className="flex flex-col items-start mb-4">
                  <div className="mb-3 w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title || 'Untitled'}</h2>
                        <p className="text-gray-600 font-medium">{job.companyName || 'N/A'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Posted on {new Date(job.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} at {new Date(job.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                        {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'N/A'}
                      </span>
                    </div>
                    {job.companyImage && (
                      <img src={`https://carrier-path.onrender.com${job.companyImage}`} alt={job.companyName} className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2" />
                    )}
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{job.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500 text-sm">📍</span>
                      <span className="text-sm">
                        <span className="font-medium">Location:</span> {job.location?.city || 'N/A'}, {job.location?.state || 'N/A'}, {job.location?.country || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500 text-sm">🏢</span>
                      <span className="text-sm">
                        <span className="font-medium">Work Type:</span> {formatField(job.jobType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500 text-sm">💼</span>
                      <span className="text-sm">
                        <span className="font-medium">Employment:</span> {formatField(job.employmentType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500 text-sm">⏱️</span>
                      <span className="text-sm">
                        <span className="font-medium">Experience:</span> {job.yearsOfExperience !== undefined ? `${job.yearsOfExperience} years` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 col-span-1 sm:col-span-2">
                      <span className="text-green-500 text-sm">💰</span>
                      <span className="text-sm">
                        <span className="font-medium">Salary:</span> {formatSalary(job.salary)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Required Tools & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(job.tools) && job.tools.length > 0 ? (
                        job.tools.map((tool, idx) => (
                          <span key={idx} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-lg border border-green-200">
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 italic">No tools specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Requirements</h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                        job.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1 text-xs">•</span>
                            <span>{req}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">No requirements specified</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    title="Recruiters cannot apply to their own jobs"
                    disabled
                    className="w-full cursor-not-allowed bg-gray-100 text-gray-400 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📩</span>
                    Apply
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center mt-12"
          >
            <div className="flex items-center gap-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`py-2 px-6 rounded-lg font-medium transition duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-md'
                }`}
              >
                Previous
              </motion.button>
              <span className="text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`py-2 px-6 rounded-lg font-medium transition duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-md'
                }`}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ViewPost;
