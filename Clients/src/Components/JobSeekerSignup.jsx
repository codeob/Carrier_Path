import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const UserAuth = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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
      const url = isLogin ? 'http://localhost:5040/api/jobseeker/login' : 'http://localhost:5040/api/jobseeker/signup';
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
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'An error occurred during submission';
      setErrorMessage(message);
      console.error('Auth error:', error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleSocialAuth = (provider) => {
    setIsLoading(true);
    alert(`${provider} authentication is not yet implemented. Please use email and password.`);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const PulseRingLoader = () => (
    <div className="fixed inset-0 bg-cover bg-center z-50 flex items-center justify-center">
      <motion.img
        src="https://i.pinimg.com/1200x/ac/31/d1/ac31d14c0df6c5a19a90ff4993bbf291.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-purple-200/60 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></div>
          <div className="absolute inset-[-8px] border-2 border-purple-400/30 rounded-full animate-ping"></div>
        </div>
        <div className="text-white text-lg sm:text-xl font-medium tracking-wider flex items-center space-x-1">
          <span>Loading</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
        <div className="text-purple-200 text-sm opacity-75">
          {isLogin ? 'Signing you in...' : 'Creating your account...'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <motion.img
        src="https://i.pinimg.com/1200x/ac/31/d1/ac31d14c0df6c5a19a90ff4993bbf291.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: 'easeInOut' }}
      />
      <div className="relative bg-white bg-opacity-90 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">{isLogin ? 'Job Seeker Login' : 'Job Seeker Signup'}</h2>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm mb-4">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  {...register('skills')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., JavaScript, Python, React"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required', 
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } 
              })}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required', 
                minLength: { value: 6, message: 'Password must be at least 6 characters' } 
              })}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
              reset();
            }}
            disabled={isLoading}
            className="text-blue-600 hover:underline ml-1 disabled:opacity-50"
          >
            {isLogin ? 'Signup' : 'Login'}
          </button>
        </p>
      </div>
      {isLoading && <PulseRingLoader />}
    </div>
  );
};

export default UserAuth;