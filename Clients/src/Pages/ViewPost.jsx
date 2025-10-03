import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import { formatDistanceToNow, format } from 'date-fns';

const ViewPost = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('');
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
        setError(error.response?.data?.message || 'Failed to load jobs.');
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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 pt-20">
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
              {filters.search || Object.values(filters).some((val) => val) ? 'Try adjusting your search or filters.' : 'No jobs available.'}
            </p>
          </div>
        )}
        {!isLoading && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4">
                <div className="flex flex-col items-start mb-2">
                  <div className="mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {job.title || 'Untitled'}
                      {isJobNew(job.createdAt) && (
                        <span className="ml-2 bg-red-100 text-red-700 text-[10px] font-semibold px-1.5 py-0.5 rounded align-middle">NEW</span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-600">{job.companyName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{formatPostedTime(job.createdAt)}</p>
                    {job.companyImage && (
                      <img
                        src={`https://carrier-path.onrender.com${job.companyImage}`}
                        alt={job.companyName || 'Company Logo'}
                        className="w-16 h-16 object-contain mt-2"
                      />
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}
                  >
                    {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'N/A'}
                  </span>
                </div>
                <div className="space-y-2 mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Description</h3>
                    <p className="text-gray-600 text-sm">{job.description || 'No description provided'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-sm">📍</span>
                    <span className="text-sm">
                      {job.location?.city || 'N/A'}, {job.location?.state || 'N/A'}, {job.location?.country || 'N/A'}
                    </span>
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
                    <span className="text-sm">
                      {job.yearsOfExperience !== undefined ? `${job.yearsOfExperience} years` : 'Not specified'}
                    </span>
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
                    type="button"
                    title="Recruiters cannot apply to their own jobs"
                    disabled
                    className="w-full cursor-not-allowed bg-green-50 text-green-400 font-medium py-2 px-3 rounded-md transition duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📩</span>
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`py-2 px-4 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } transition duration-200`}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`py-2 px-4 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } transition duration-200`}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPost;
