import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaBriefcase, FaCheckCircle, FaClock, FaTimesCircle, FaUsers, FaFileAlt, FaChartLine } from 'react-icons/fa';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

const Analytics = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    jobStats: { totalJobs: 0, publishedJobs: 0, draftJobs: 0 },
    applicationStats: { total: 0, accepted: 0, rejected: 0, pending: 0 },
    recentJobs: [],
    topJobs: [],
    recentApplicationUpdates: [],
    weeklyApplicationCounts: [],
    applicationHistory: [],
  });

  // Register Chart.js components once on mount
  useEffect(() => {
    try {
      ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);
    } catch {
      // ignore duplicate registrations
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/recruiter/auth');
        return;
      }

      const response = await axios.get('https://carrier-path.onrender.com/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics({
        jobStats: response.data?.jobStats || { totalJobs: 0, publishedJobs: 0, draftJobs: 0 },
        applicationStats: response.data?.applicationStats || { total: 0, accepted: 0, rejected: 0, pending: 0 },
        recentJobs: response.data?.recentJobs || [],
        topJobs: response.data?.topJobs || [],
        recentApplicationUpdates: response.data?.recentApplicationUpdates || [],
        weeklyApplicationCounts: response.data?.weeklyApplicationCounts || [],
        applicationHistory: response.data?.applicationHistory || [],
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load analytics data. Please try again.';
      setError(errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/recruiter/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  const doughnutData = useMemo(() => ({
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [
      {
        label: 'Application Status',
        data: [
          analytics.applicationStats.accepted,
          analytics.applicationStats.rejected,
          analytics.applicationStats.pending,
        ],
        backgroundColor: ['#10B981', '#EF4444', '#14B8A6'],
        borderColor: ['#059669', '#DC2626', '#0F766E'],
        borderWidth: 2,
      },
    ],
  }), [analytics.applicationStats.accepted, analytics.applicationStats.rejected, analytics.applicationStats.pending]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
          color: '#374151',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
        bodyFont: { size: window.innerWidth < 640 ? 10 : 12 },
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }), []);

  const barData = useMemo(() => ({
    labels: ['Total', 'Published', 'Draft'],
    datasets: [
      {
        label: 'Job Counts',
        data: [
          analytics.jobStats.totalJobs,
          analytics.jobStats.publishedJobs,
          analytics.jobStats.draftJobs,
        ],
        backgroundColor: ['#14B8A6', '#10B981', '#F59E0B'],
        borderColor: ['#0F766E', '#059669', '#D97706'],
        borderWidth: 2,
      },
    ],
  }), [analytics.jobStats.totalJobs, analytics.jobStats.publishedJobs, analytics.jobStats.draftJobs]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Jobs',
          color: '#374151',
          font: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
        },
        ticks: {
          color: '#6B7280',
          font: { size: window.innerWidth < 640 ? 10 : 12, weight: '500' },
          stepSize: 1,
          padding: 10,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderDash: [5, 5],
        },
      },
      x: {
        ticks: {
          color: '#374151',
          font: { size: window.innerWidth < 640 ? 10 : 12, weight: '500' },
          padding: 10,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
        bodyFont: { size: window.innerWidth < 640 ? 10 : 12 },
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }), []);

  const lineData = useMemo(() => ({
    labels: analytics.weeklyApplicationCounts.map((_, index) => `Week ${index + 1}`),
    datasets: [
      {
        label: 'Applications',
        data: analytics.weeklyApplicationCounts,
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderColor: '#14B8A6',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#14B8A6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }), [analytics.weeklyApplicationCounts]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Applications',
          color: '#374151',
          font: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
        },
        ticks: {
          color: '#6B7280',
          font: { size: window.innerWidth < 640 ? 10 : 12, weight: '500' },
          stepSize: 1,
          padding: 10,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderDash: [5, 5],
        },
      },
      x: {
        title: {
          display: true,
          text: 'Weeks',
          color: '#374151',
          font: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
        },
        ticks: {
          color: '#374151',
          font: { size: window.innerWidth < 640 ? 10 : 12, weight: '500' },
          padding: 10,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
        bodyFont: { size: window.innerWidth < 640 ? 10 : 12 },
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }), []);

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return window.innerWidth < 640
        ? d.toLocaleDateString() // Short date for mobile
        : d.toLocaleString(); // Full date + time for larger screens
    } catch {
      return '';
    }
  };

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://carrier-path.onrender.com/api/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refetch analytics to update the data
      await fetchAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete application.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      <div className="max-w-full sm:max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaChartLine className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Analytics Dashboard</h1>
              <p className="text-base text-slate-600 mt-1">Get insights into your job listings and applications</p>
            </div>
          </div>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center py-16"
            aria-label="Loading analytics"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
            <p className="text-slate-600 text-lg font-medium">Loading your analytics...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FaBriefcase className="text-emerald-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Total Jobs</h3>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{analytics.jobStats.totalJobs}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="text-green-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Published Jobs</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{analytics.jobStats.publishedJobs}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-yellow-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Draft Jobs</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{analytics.jobStats.draftJobs}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-emerald-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Total Applications</h3>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{analytics.applicationStats.total}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="text-green-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Accepted</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{analytics.applicationStats.accepted}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FaTimesCircle className="text-red-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Rejected</h3>
                </div>
                <p className="text-3xl font-bold text-red-600">{analytics.applicationStats.rejected}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaClock className="text-yellow-600 text-lg" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Pending</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{analytics.applicationStats.pending}</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FaChartLine className="text-emerald-600 text-base" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Application Status Distribution</h3>
                  </div>
                  <div className="h-64 lg:h-80 w-full">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FaChartLine className="text-teal-600 text-base" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Weekly Application Trends</h3>
                  </div>
                  <div className="h-64 lg:h-80 w-full">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-emerald-600 text-base" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Application History</h3>
                </div>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Latest {analytics.applicationHistory.length} entries</span>
              </div>
              {analytics.applicationHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="text-slate-400 text-5xl mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">No application history yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto touch-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[120px]">Applicant</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[140px]">Email</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[120px]">Job</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px]">Years</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[100px]">Status</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[120px]">Applied</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {analytics.applicationHistory.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{item.applicantName}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                            {item.applicantEmail || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">{item.jobTitle}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">{item.jobYearsOfExperience ?? 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                              item.status === 'accepted'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : item.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">{formatDateTime(item.createdAt)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;