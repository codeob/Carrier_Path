import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const UserAuth = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const bgUrl = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'user') {
      navigate('/jobseeker/dashboard');
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const url = isLogin ? 'https://carrier-path.onrender.com/api/jobseeker/login' : 'https://carrier-path.onrender.com/api/jobseeker/signup';
      const payload = isLogin
        ? { email: data.email, password: data.password }
        : {
            name: data.name,
            email: data.email,
            password: data.password,
            skills: data.skills ? data.skills.split(',').map(skill => skill.trim()) : []
          };
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.data.token || !response.data.jobSeeker?.name) {
        throw new Error('Invalid response from server');
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userName', response.data.jobSeeker.name);
      localStorage.setItem('role', 'user');
      setTimeout(() => {
        setIsLoading(false);
        reset();
        navigate('/jobseeker/dashboard');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'An error occurred during submission';
      setErrorMessage(message);
      console.error('Auth error:', error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const PulseRingLoader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.65)), url(${bgUrl})`,
        }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      {/* Spinner */}
      <div className="relative flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-teal-200/60 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-teal-500 rounded-full shadow-lg shadow-teal-500/50" />
        </div>
        <div className="text-white text-base font-medium tracking-wider">{isLogin ? 'Signing you in...' : 'Creating your account...'}</div>
      </div>
    </div>
  );

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background with dark gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.65)), url(${bgUrl})` }}
        />
        {/* Animated blobs */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-56 w-56 md:h-64 md:w-64 rounded-full bg-green-400/30 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-64 w-64 md:h-72 md:w-72 rounded-full bg-teal-400/30 blur-3xl"
          animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen py-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-2xl p-5 sm:p-6 max-h-[92vh]"
          >
            <h2 className="text-white text-xl sm:text-2xl font-bold text-center">
              {isLogin ? 'Job Seeker Login' : 'Job Seeker Signup'}
            </h2>
            <p className="mt-1 text-center text-gray-200 text-xs sm:text-sm">
              Find roles, save searches, and track applications.
            </p>

            {errorMessage && (
              <div className="mt-3 bg-rose-800/20 ring-1 ring-rose-300/30 text-rose-100 px-3 py-2 rounded-lg text-xs">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="mt-3 bg-green-800/20 ring-1 ring-green-300/30 text-green-100 px-3 py-2 rounded-lg text-xs">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-white/90 mb-1">Full Name *</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className={`block w-full rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 border border-white/20 focus:ring-2 focus:ring-teal-500 focus:outline-none px-3 py-2 text-sm ${errors.name ? 'ring-rose-300/60' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-rose-200 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/90 mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      {...register('skills')}
                      className="block w-full rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 border border-white/20 focus:ring-2 focus:ring-teal-500 focus:outline-none px-3 py-2 text-sm"
                      placeholder="e.g., JavaScript, Python, React"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-medium text-white/90 mb-1">Email *</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  className={`block w-full rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 border border-white/20 focus:ring-2 focus:ring-teal-500 focus:outline-none px-3 py-2 text-sm ${errors.email ? 'ring-rose-300/60' : ''}`}
                  placeholder="user@email.com"
                />
                {errors.email && <p className="text-rose-200 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/90 mb-1">Password *</label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                  className={`block w-full rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 border border-white/20 focus:ring-2 focus:ring-teal-500 focus:outline-none px-3 py-2 text-sm ${errors.password ? 'ring-rose-300/60' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-rose-200 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-gradient-to-r from-green-500 to-teal-500 px-5 py-2.5 text-white text-sm font-semibold shadow-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? 'Login' : 'Signup'}
              </button>
            </form>

            <p className="mt-3 text-center text-xs sm:text-sm text-white/90">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage('');
                  reset();
                }}
                disabled={isLoading}
                className="ml-1 text-teal-300 hover:underline disabled:opacity-50"
              >
                {isLogin ? 'Signup' : 'Login'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      {isLoading && <PulseRingLoader />}
    </div>
  );
};
export default UserAuth;
