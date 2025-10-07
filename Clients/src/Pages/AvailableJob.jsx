import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { debounce } from 'lodash';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Available = () => {
  const navigate = useNavigate();
  const locationRouter = useLocation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [highlightJobId, setHighlightJobId] = useState(null);

  const jobsPerPage = 10;

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    const fetchJobs = async () => {
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
        const response = await axios.get('https://carrier-path.onrender.com/api/jobs/public', { params });
        const fetchedJobs = Array.isArray(response.data.jobs || response.data.data || response.data)
          ? (response.data.jobs || response.data.data || response.data)
          : [];
        setJobs(fetchedJobs);
        setTotalPages(response.data.totalPages || Math.ceil(fetchedJobs.length / jobsPerPage));
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage, searchTerm, filters, sortBy, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams(locationRouter.search);
    const jobId = params.get('jobId');
    if (jobId && jobs.length > 0) {
      setHighlightJobId(jobId);
      const el = document.getElementById(`job-${jobId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightJobId(null), 3000);
      }
    }
  }, [locationRouter.search, jobs]);

  const handleApply = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmissionError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setSubmissionError('Please log in to apply for this job.');
        navigate('/user/auth');
        return;
      }
      if (!data.resume || !data.resume[0]) {
        setSubmissionError('Please upload a resume.');
        return;
      }
      const formData = new FormData();
      formData.append('jobId', selectedJob?._id);
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('message', data.message || '');
      formData.append('resume', data.resume[0]);
      if (data.portfolioLink) formData.append('portfolioLink', data.portfolioLink);
      if (data.githubLink) formData.append('githubLink', data.githubLink);
      const response = await axios.post('https://carrier-path.onrender.com/api/applications', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 201) {
        setShowApplyModal(false);
        reset();
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setSubmissionError('');
        }, 2500);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application. Please try again.';
      setSubmissionError(errorMessage);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setTimeout(() => navigate('/user/auth'), 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(
    job => {
      const matchesSearch =
        (!searchTerm ||
          job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job?.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(job?.tools) && job.tools.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase()))));
      const matchesFilters =
        (!filters.jobType || job?.jobType === filters.jobType) &&
        (!filters.employmentType || job?.employmentType === filters.employmentType) &&
        (!filters.location || (job?.location?.city || '').toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.minSalary || (job?.salary?.yearly && Number(job.salary.yearly) >= Number(filters.minSalary))) &&
        (!filters.maxSalary || (job?.salary?.yearly && Number(job.salary.yearly) <= Number(filters.maxSalary))) &&
        (!filters.experience || (job?.yearsOfExperience !== undefined && Number(job.yearsOfExperience) >= Number(filters.experience)));
      const isPublished = job?.status === 'published';
      return matchesSearch && matchesFilters && isPublished;
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
    if (!salary) return 'Not specified';
    const salaryTypes = [
      { key: 'hourly', label: '/hour' },
      { key: 'weekly', label: '/week' },
      { key: 'monthly', label: '/month' },
      { key: 'yearly', label: '/year' },
    ];
    const availableSalaries = salaryTypes
      .filter(type => salary?.[type.key])
      .map(type => `$${Number(salary[type.key]).toLocaleString()}${type.label}`);
    return availableSalaries.length > 0 ? availableSalaries.join(', ') : 'Not specified';
  };

  const formatField = (value) => {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ') : 'N/A';
  };

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
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover thousands of opportunities from top companies. Your next career move starts here.
          </p>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">10K+</div>
              <div className="text-gray-600">Active Jobs</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">500+</div>
              <div className="text-gray-600">Companies</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">50K+</div>
              <div className="text-gray-600">Job Seekers</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
              <span className="text-green-500">🔒</span>
              <span className="text-sm font-medium text-gray-700">Secure & Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
              <span className="text-blue-500">⭐</span>
              <span className="text-sm font-medium text-gray-700">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
              <span className="text-purple-500">🏆</span>
              <span className="text-sm font-medium text-gray-700">Award Winning</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Find Your Perfect Job</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Search Jobs</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, company, or tools..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                  aria-label="Search jobs"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Work Arrangement</label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                aria-label="Work arrangement"
              >
                <option value="">All Work Types</option>
                {['remote', 'in-office', 'hybrid'].map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Employment Type</label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                aria-label="Employment type"
              >
                <option value="">All Employment Types</option>
                {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Location</label>
              <input
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="Enter city or country"
                aria-label="Location"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Min Salary (Yearly)</label>
              <input
                name="minSalary"
                type="number"
                min="0"
                value={filters.minSalary}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="Enter min salary"
                aria-label="Minimum salary"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Max Salary (Yearly)</label>
              <input
                name="maxSalary"
                type="number"
                min="0"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="Enter max salary"
                aria-label="Maximum salary"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Min Experience (Years)</label>
              <input
                name="experience"
                type="number"
                min="0"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                placeholder="Enter years"
                aria-label="Minimum experience"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Sort By</label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 shadow-sm"
                aria-label="Sort by"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="salary.yearly:desc">Salary (High to Low)</option>
                <option value="salary.yearly:asc">Salary (Low to High)</option>
              </select>
            </motion.div>
          </div>
        </motion.div>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
            aria-label="Loading jobs"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Finding perfect jobs for you...</span>
          </motion.div>
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
              {searchTerm || Object.values(filters).some(val => val) ? 'Try adjusting your search or filters.' : 'No published jobs available.'}
            </p>
            <p className="text-gray-600">Raw jobs fetched: {jobs.length}</p>
          </div>
        )}
        {!isLoading && filteredJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-6"
          >
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  id={`job-${job._id}`}
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg border ${highlightJobId === job._id ? 'ring-2 ring-green-400' : 'border-gray-200'} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 w-full`}
                >
                  <div className="flex flex-col items-start mb-4">
                    <div className="mb-3 w-full">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
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
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
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
                      <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
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
                          job.tools.map((tool, index) => (
                            <span key={index} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-lg border border-green-200">
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
                          job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
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
                  <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyModal(true);
                      }}
                      className="w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium py-2 px-28 rounded-md transition duration-200 flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow-md"
                    >
                      <span>🚀</span>
                      Apply Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-between items-center"
          >
            <motion.button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              ← Previous
            </motion.button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Page</span>
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold">
                {currentPage}
              </span>
              <span className="text-sm font-medium text-gray-600">of {totalPages}</span>
            </div>
            <motion.button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Next →
            </motion.button>
          </motion.div>
        )}
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-md p-3 w-full max-w-xs shadow-lg border border-gray-200">
            <h2 className="text-base font-semibold mb-2 text-gray-900 text-center">Apply for {selectedJob?.title}</h2>
            {submissionError && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-2 py-1.5 rounded text-xs mb-2">
                {submissionError}
              </div>
            )}
            <form onSubmit={handleSubmit(handleApply)} className="space-y-2" encType="multipart/form-data">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-indigo-500 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="text-red-500 text-[10px] mt-0.5">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Portfolio (Optional)</label>
                <input
                  type="url"
                  {...register('portfolioLink')}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GitHub (Optional)</label>
                <input
                  type="url"
                  {...register('githubLink')}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
                <textarea
                  {...register('message')}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                  placeholder="Why are you a good fit?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resume (PDF) *</label>
                <input
                  type="file"
                  {...register('resume', { required: 'Resume is required' })}
                  accept="application/pdf"
                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-indigo-500 ${errors.resume ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.resume && <p className="text-red-500 text-[10px] mt-0.5">{errors.resume.message}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyModal(false);
                    setSubmissionError('');
                    reset();
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-md p-4 w-full max-w-xs text-center shadow-lg border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 text-green-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-base font-semibold mb-1">Application Submitted!</h2>
            <p className="text-gray-600 mb-3 text-xs">Your application for {selectedJob?.title} has been submitted.</p>
            <motion.button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedJob(null);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:from-green-600 hover:to-teal-600 shadow-md"
            >
              Continue Exploring
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Available;