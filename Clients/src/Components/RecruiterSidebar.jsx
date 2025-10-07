import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { motion } from 'framer-motion';

const RecruiterSidebar = ({ isOpen, toggleSidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', name: '', email: '', company: '' });
  const [unreadApplicationCount, setUnreadApplicationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = 'https://carrier-path.onrender.com';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/recruiter/signup');
          return;
        }
        const response = await axios.get(`${BASE_URL}/api/recruiter/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUserProfile(response.data.recruiter);
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        const userName = localStorage.getItem('userName');
        if (userName) {
          setUserProfile(prevState => ({ ...prevState, name: userName }));
        }
        if (error.response?.status === 401) {
          navigate('/recruiter/signup');
        }
      }
    };

    const fetchUnreadCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const applicationResponse = await axios.get(`${BASE_URL}/api/applications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const pendingCount = applicationResponse.data.filter(app => app.status === 'pending').length;
        setUnreadApplicationCount(pendingCount);
      } catch (error) {
        console.error('Error fetching unread counts:', error.response?.data || error.message);
      }
    };

    fetchProfile();
    fetchUnreadCounts();
  }, [navigate]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${BASE_URL}/api/recruiter/logout`, {}, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userProfile');
    navigate('/recruiter/signup');
  };

  const markApplicationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post(`${BASE_URL}/api/applications/mark-as-read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setUnreadApplicationCount(0);
    } catch (error) {
      console.error('Error marking applications as read:', error.response?.data || error.message);
    }
  };

  const handleMenuItemClick = (itemOnClick) => {
    if (itemOnClick) {
      itemOnClick();
    }
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getInitials = (firstName, lastName, name) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = (firstName, lastName, name) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (name) {
      return name;
    }
    return localStorage.getItem('userName') || 'User';
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/recruiter/dashboard/viewPost', label: 'View Posts', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/></svg> },
    { path: '/recruiter/dashboard/CreateJobs', label: 'Create Job', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="currentColor"/></svg> },
    { path: '/recruiter/dashboard/JobList', label: 'Job Listings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6H12L10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4L20 6ZM12 18H4V8H12V18ZM14 6V18H20V6H14Z" fill="currentColor"/></svg> },
    { path: '/recruiter/dashboard/Applications', label: 'Applications', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 9H18.5L13 3.5V9ZM6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z" fill="currentColor"/></svg>, badge: unreadApplicationCount, onClick: markApplicationsAsRead },
    { path: '/recruiter/dashboard/Analytics', label: 'Analytics', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13H9V21H3V13ZM11 3H17V21H11V3ZM19 7H15V21H19V7Z" fill="currentColor"/></svg> },
  ];

  return (
    <motion.div
      initial={{ x: isOpen ? 0 : -320 }}
      animate={{ x: isOpen ? 0 : -320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 h-full bg-white text-gray-900 font-sans z-50 shadow-2xl border-r border-gray-200 flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64 md:w-56 lg:w-64'}
        lg:translate-x-0`}
    >
      {/* Logo/Branding */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-16 bg-gradient-to-r from-green-600 via-green-700 to-teal-600 border-b border-teal-700 px-4 shadow-md`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 7L12 12L22 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22V12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {!isCollapsed && (
          <div className="ml-3">
            <h1 className="text-xl font-bold text-white truncate">JobFinder</h1>
            <p className="text-xs text-white">Recruiter Portal</p>
          </div>
        )}
      </motion.div>

      {/* Navigation Links */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex flex-col gap-8 px-3 py-4 flex-1"
      >
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className="relative group"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={item.path}
                onClick={() => handleMenuItemClick(item.onClick)}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg text-gray-900 text-base hover:bg-green-100 hover:text-green-600 transition-all duration-200 shadow-sm hover:shadow-md
                  ${isCollapsed ? 'justify-center px-0' : ''}
                  ${isActive(item.path) ? 'bg-green-100 text-green-600 shadow-md' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {item.badge > 0 && (
                  <span className="absolute top-1 right-2 bg-red-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
            {isCollapsed && item.badge > 0 && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                {item.label} ({item.badge})
              </div>
            )}
          </motion.div>
        ))}
      </motion.nav>

      {/* User Profile and Collapse/Expand Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 bg-green-50 border-t border-gray-200 h-14 mt-auto`}
      >
        {!isCollapsed && (
          <>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-medium mr-2 shadow-md">
                {getInitials(userProfile.firstName, userProfile.lastName, userProfile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-gray-800 text-sm font-semibold truncate">
                  {getFullName(userProfile.firstName, userProfile.lastName, userProfile.name)}
                </span>
                <p className="text-xs text-gray-600 truncate">{userProfile.email || 'user@company.com'}</p>
                {userProfile.company && (
                  <p className="text-xs text-gray-500 truncate">{userProfile.company}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCollapse}
                className="text-green-600 text-lg hover:text-green-500 transition-colors duration-200"
                aria-label="Collapse Sidebar"
              >
                <LuChevronLeft />
              </motion.button>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-medium shadow-md">
              {getInitials(userProfile.firstName, userProfile.lastName, userProfile.name)}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCollapse}
              className="text-green-600 text-lg hover:text-green-500 transition-colors duration-200"
              aria-label="Expand Sidebar"
            >
              <LuChevronRight />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Logout Button */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-red-600 text-base hover:bg-red-100 transition-all duration-200
            ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
          </svg>
          {!isCollapsed && <span className="truncate">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default RecruiterSidebar;