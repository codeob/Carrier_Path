import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaFileAlt,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBriefcase
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
const JobSeekerNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setIsMobileMenuOpen(false);
    }
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/user/auth');
          return;
        }
        const response = await axios.get('https://carrier-path.onrender.com/api/jobseeker/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUserProfile(response.data.jobSeeker);
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/user/auth');
          return;
        }
        const userName = localStorage.getItem('userName');
        if (userName) {
          setUserProfile(prevState => ({ ...prevState, name: userName }));
        }
      }
    };
    const fetchUnreadNotificationCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('https://carrier-path.onrender.com/api/messages/unread-count', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUnreadNotificationCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/user/auth');
        }
      }
    };
    fetchProfile();
    fetchUnreadNotificationCount();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const response = await axios.get('https://carrier-path.onrender.com/api/messages/unread-count', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUnreadNotificationCount(response.data.count || 0);
      } catch (e) {
        if (e?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('role');
          localStorage.removeItem('userProfile');
          navigate('/user/auth');
        }
      }
    }, 60000); // poll every 60 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('https://carrier-path.onrender.com/api/jobseeker/logout', {}, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userProfile');
    navigate('/user/auth');
  }, [navigate]);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const isActive = (path) => location.pathname === path;
  const menuItems = [
    { path: '/jobseeker/dashboard/availableJobs', label: 'Available Jobs', icon: FaTachometerAlt },
    { path: '/jobseeker/dashboard/cvRater', label: 'AI CV Rater', icon: FaFileAlt },
    { path: '/jobseeker/dashboard/notifications', label: 'Notifications', icon: FaBell, badge: unreadNotificationCount },
  
  ];
  const getInitials = (name) => {
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };
  const getFullName = (name) => {
    if (name) {
      return name;
    }
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      return storedName;
    }
    return 'User';
  };
  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg shadow-black/10 z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-md"
                >
                  <FaBriefcase size={20} className="text-white" />
                </motion.div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">JobFinder</h1>
                  <p className="text-xs text-gray-500">Job Seeker Portal</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      } transition duration-200`}
                    >
                      <Icon size={16} className="mr-2" />
                      {item.label}
                      {item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                >
                  {getInitials(userProfile.name)}
                </motion.div>
                <span className="text-sm text-gray-900">{getFullName(userProfile.name)}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition duration-200"
                >
                  <FaSignOutAlt size={16} className="mr-2" />
                  Logout
                </motion.button>
              </div>
            </div>
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        } transition duration-200`}
                      >
                        <Icon size={18} className="mr-3" />
                        {item.label}
                        {item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: menuItems.length * 0.1 }}
                  className="flex items-center px-4 py-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-md">
                    {getInitials(userProfile.name)}
                  </div>
                  <span className="text-sm text-gray-900">{getFullName(userProfile.name)}</span>
                </motion.div>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + 1) * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition duration-200"
                >
                  <FaSignOutAlt size={18} className="mr-3" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};
export default JobSeekerNavbar;