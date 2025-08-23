import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
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
  });

  // Register Chart.js components once on mount to avoid top-level side effects
  useEffect(() => {
    try {
      ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
    } catch (_) {
      // ignore duplicate registrations
    }
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/recruiter/auth');
          return;
        }

        const response = await axios.get('http://localhost:5040/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAnalytics(
          response.data || {
            jobStats: { totalJobs: 0, publishedJobs: 0, draftJobs: 0 },
            applicationStats: { total: 0, accepted: 0, rejected: 0, pending: 0 },
          }
        );
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load analytics data. Please try again.';
        setError(errorMsg);
        if (err.response?.status === 401) {
          navigate('/recruiter/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

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
        backgroundColor: ['#34D399', '#EF4444', '#FBBF24'],
        borderColor: ['#10B981', '#DC2626', '#D97706'],
        borderWidth: 1,
      },
    ],
  }), [analytics.applicationStats.accepted, analytics.applicationStats.rejected, analytics.applicationStats.pending]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14 },
          color: '#1F2937',
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        cornerRadius: 6,
      },
    },
    cutout: '60%',
  }), []);

  const barData = useMemo(() => ({
    labels: ['Total Jobs', 'Published Jobs', 'Draft Jobs'],
    datasets: [
      {
        label: 'Job Counts',
        data: [
          analytics.jobStats.totalJobs,
          analytics.jobStats.publishedJobs,
          analytics.jobStats.draftJobs,
        ],
        backgroundColor: ['#4F46E5', '#10B981', '#FBBF24'],
        borderColor: ['#4338CA', '#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  }), [analytics.jobStats.totalJobs, analytics.jobStats.publishedJobs, analytics.jobStats.draftJobs]);

  const barOptions = useMemo(() => ({
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Jobs',
          color: '#1F2937',
          font: { size: 14 },
        },
        ticks: {
          color: '#1F2937',
          font: { size: 12 },
        },
      },
      x: {
        ticks: {
          color: '#1F2937',
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        cornerRadius: 6,
      },
    },
  }), []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of your job listings and applications</p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12" aria-label="Loading analytics">
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

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Jobs</h3>
                <p className="text-3xl font-bold text-indigo-600">{analytics.jobStats.totalJobs}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Published Jobs</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.jobStats.publishedJobs}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Draft Jobs</h3>
                <p className="text-3xl font-bold text-yellow-600">{analytics.jobStats.draftJobs}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Applications</h3>
                <p className="text-3xl font-bold text-indigo-600">{analytics.applicationStats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Accepted Applications</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.applicationStats.accepted}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Rejected Applications</h3>
                <p className="text-3xl font-bold text-red-600">{analytics.applicationStats.rejected}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Pending Applications</h3>
                <p className="text-3xl font-bold text-yellow-600">{analytics.applicationStats.pending}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Statistics</h3>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
