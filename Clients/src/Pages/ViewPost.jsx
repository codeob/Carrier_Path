import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';

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
        const response = await axios.get('http://localhost:5040/api/jobs', {
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
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load jobs.');
        setJobs([]);
        if (err.response?.status === 401) {
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
                <option value="salary.yearly:asc">Salary (Low to High</option>
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
              <label className="block text sm font-medium text-gray-700 mb-2">Max Salary (Yearly)</label>
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
              <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4 max-w-md">
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
                    {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
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
                          <span key={index} className="bg-blue-50 text-blue-700 text-xs font-medium px-1 py-0.5 rounded border border-blue-200">
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
                    type="button"
                    title="Recruiters cannot apply to their own jobs"
                    disabled
                    className="cursor-not-allowed bg-gray-100 text-gray-400 font-medium py-1 px-2 rounded-md transition duration-200 flex items-center gap-1 text-sm"
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
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
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

export default ViewPost;
