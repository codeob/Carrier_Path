import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
        setError('');
        const params = { 
          search: searchTerm, 
          status: filter === 'all' ? undefined : filter 
        };
        const response = await axios.get('https://carrier-path.onrender.com/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` },
          params,
        });
        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
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
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://carrier-path.onrender.com/api/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete job.');
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
        companyName: job.companyName || '',
        companyImage: job.companyImage || '',
      };
      const response = await axios.put(
        `https://carrier-path.onrender.com/api/jobs/${jobId}`,
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
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
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
      .map(type => `$${salary[type.key].toLocaleString()}${type.label}`);
    return availableSalaries.length > 0 ? availableSalaries.join(', ') : 'Not specified';
  };
  const formatField = (value) => {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ') : 'N/A';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Job Management</h1>
                <p className="text-slate-600 text-base">Manage your job listings and track their status</p>
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <button
                onClick={() => navigate('/recruiter/dashboard/CreateJobs')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">+</span>
                Create New Job
              </button>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Search Jobs</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, location, or tools..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-lg">🔍</span>
                </div>
              </div>
            </div>
            <div className="sm:w-56">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
              >
                <option value="all">All Jobs</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
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
        {!isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 sm:p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-6 text-slate-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No jobs found</h3>
            <p className="text-slate-600 text-lg mb-6">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Get started by creating your first job listing.'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => navigate('/recruiter/dashboard/CreateJobs')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Your First Job
              </button>
            )}
          </div>
        )}
        {!isLoading && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 w-full"
              >
                <div className="flex flex-col items-start mb-4">
                  <div className="mb-3 w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h2>
                        <p className="text-slate-600 font-medium">{job.companyName}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatPostedTime(job.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    {job.companyImage && (
                      <img src={`https://carrier-path.onrender.com${job.companyImage}`} alt={job.companyName} className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-slate-50 p-2" />
                    )}
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Job Description</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{job.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-emerald-500 text-sm">📍</span>
                      <span className="text-sm">
                        <span className="font-medium">Location:</span> {job.location?.city || 'N/A'}, {job.location?.state || 'N/A'}, {job.location?.country || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-emerald-500 text-sm">🏢</span>
                      <span className="text-sm">
                        <span className="font-medium">Work Type:</span> {formatField(job.jobType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-emerald-500 text-sm">💼</span>
                      <span className="text-sm">
                        <span className="font-medium">Employment:</span> {formatField(job.employmentType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-emerald-500 text-sm">⏱️</span>
                      <span className="text-sm">
                        <span className="font-medium">Experience:</span> {job.yearsOfExperience !== undefined ? `${job.yearsOfExperience} years` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 col-span-1 sm:col-span-2">
                      <span className="text-emerald-500 text-sm">💰</span>
                      <span className="text-sm">
                        <span className="font-medium">Salary:</span> {formatSalary(job.salary)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Required Tools & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(job.tools) && job.tools.length > 0 ? (
                        job.tools.map((tool, index) => (
                          <span
                            key={index}
                            className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-lg border border-emerald-200"
                          >
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500 italic">No tools specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Job Requirements</h3>
                    <ul className="text-slate-600 text-sm space-y-1">
                      {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                        job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1 text-xs">•</span>
                            <span>{req}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">No requirements specified</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => navigate('/recruiter/dashboard/CreateJobs', { state: { job } })}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                  >
                    <span>✏️</span>
                    Edit
                  </button>
                  {job.status !== 'published' && (
                    <button
                      onClick={() => handleSubmitJob(job._id, 'published')}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                    >
                      <span>✅</span>
                      Publish
                    </button>
                  )}
                  {job.status !== 'archived' && (
                    <button
                      onClick={() => handleSubmitJob(job._id, 'archived')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                    >
                      <span>🗄️</span>
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                  >
                    <span>🗑️</span>
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default JobList;