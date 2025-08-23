import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { debounce } from 'lodash';

const Available = () => {
  const navigate = useNavigate();
  const locationRouter = useLocation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
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
        setError('');
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
        const response = await axios.get('http://localhost:5040/api/jobs/public', { params });
        const fetchedJobs = Array.isArray(response.data.jobs || response.data.data || response.data)
          ? (response.data.jobs || response.data.data || response.data)
          : [];
        setJobs(fetchedJobs);
        setTotalPages(response.data.totalPages || Math.ceil(fetchedJobs.length / jobsPerPage));
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.response?.data?.message || 'Failed to load jobs. Please try again.');
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
      const response = await axios.post('http://localhost:5040/api/applications', formData, {
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

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 pt-20 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Posted Jobs</h1>
              <p className="text-gray-600">Cards match the public view; apply is disabled for your jobs.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => navigate('/recruiter/dashboard/CreateJob')}
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
                  placeholder="Search by title, company, or tools..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  aria-label="Search jobs"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                aria-label="Work arrangement"
              >
                <option value="">All Work Types</option>
                {['remote', 'in-office', 'hybrid'].map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                aria-label="Employment type"
              >
                <option value="">All Employment Types</option>
                {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="Enter city or country"
                aria-label="Location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary (Yearly)</label>
              <input
                name="minSalary"
                type="number"
                min="0"
                value={filters.minSalary}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="Enter min salary"
                aria-label="Minimum salary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary (Yearly)</label>
              <input
                name="maxSalary"
                type="number"
                min="0"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="Enter max salary"
                aria-label="Maximum salary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (Years)</label>
              <input
                name="experience"
                type="number"
                min="0"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="Enter years"
                aria-label="Minimum experience"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                aria-label="Sort by"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="salary.yearly:desc">Salary (High to Low)</option>
                <option value="salary.yearly:asc">Salary (Low to High)</option>
              </select>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center py-12" aria-label="Loading jobs">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              {searchTerm || Object.values(filters).some(val => val) ? 'Try adjusting your search or filters.' : 'No published jobs available.'}
            </p>
            <p className="text-gray-600">Raw jobs fetched: {jobs.length}</p>
          </div>
        )}
        {!isLoading && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <div id={`job-${job._id}`} key={job._id} className={`bg-white rounded-lg shadow-sm border ${highlightJobId === job._id ? 'ring-2 ring-indigo-400' : 'border-gray-200'} hover:shadow-md transition-shadow duration-200 p-4 max-w-md`}>
                <div className="flex flex-col items-start mb-2">
                  <div className="mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-sm text-gray-600">{job.companyName || 'N/A'}</p>
                    {job.companyImage && (
                      <img
                        src={`http://localhost:5040${job.companyImage}`}
                        alt={job.companyName || 'Company Logo'}
                        className="w-16 h-16 object-contain mt-2"
                      />
                    )}
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
                    <span className="text-gray-400 text-sm">��</span>
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
                        <span className="text-gray-600">No requirements specified</span>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowApplyModal(true);
                    }}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-md transition duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📩</span>
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
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
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedJob(null);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Available;