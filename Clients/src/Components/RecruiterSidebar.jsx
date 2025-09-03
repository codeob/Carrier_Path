import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
const RecruiterSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', name: '', email: '', company: '' });
  const [unreadApplicationCount, setUnreadApplicationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
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
  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        return;
      }
      // Fetch unread application count (count pending applications)
      const applicationResponse = await axios.get('http://localhost:5040/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Application response:', applicationResponse.data);
      const pendingCount = applicationResponse.data.filter(app => app.status === 'pending').length;
      setUnreadApplicationCount(pendingCount);
      // Fetch unread message count
      const messageResponse = await axios.get('http://localhost:5040/api/messages/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Unread message count response:', messageResponse.data);
      setUnreadMessageCount(messageResponse.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread counts:', error.response?.data || error.message);
    }
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to auth');
          navigate('/recruiter/signup');
          return;
        }
        const response = await axios.get('http://localhost:5040/api/recruiter/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('Profile response:', response.data);
        setUserProfile(response.data.recruiter);
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        const userName = localStorage.getItem('userName');
        if (userName) {
          setUserProfile(prevState => ({ ...prevState, name: userName }));
        }
      }
    };
    fetchProfile();
    fetchUnreadCounts();
  }, [navigate]);
  const handleLogout = useCallback(async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://localhost:5040/api/recruiter/logout', {}, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
    }
   
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userProfile');
   
    navigate('/recruiter/signup');
  }, [navigate]);
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };
  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };
  const markApplicationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for marking applications as read');
        return;
      }
      const response = await axios.post('http://localhost:5040/api/applications/mark-as-read', {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Mark applications as read response:', response.data);
      setUnreadApplicationCount(0); // Reset count after marking as read
      await fetchUnreadCounts(); // Refresh counts to ensure consistency
    } catch (error) {
      console.error('Error marking applications as read:', error.response?.data || error.message);
    }
  };
  const handleApplicationsClick = () => {
    closeMobileMenu();
    if (unreadApplicationCount > 0) {
      console.log('Triggering markApplicationsAsRead, current unread: ', unreadApplicationCount);
      markApplicationsAsRead();
    }
  };
  const isActive = (path) => location.pathname === path;
  const menuItems = [
    { path: '/recruiter/dashboard/viewPost', label: 'View Posts', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/></svg> },
    { path: '/recruiter/dashboard/CreateJobs', label: 'Create Job', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="currentColor"/></svg> },
    { path: '/recruiter/dashboard/JobList', label: 'Job Listings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6H12L10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4L20 6ZM12 18H4V8H12V18ZM14 6V18H20V6H14Z" fill="currentColor"/></svg> },
    { path: '/recruiter/dashboard/Applications', label: 'Applications', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 9H18.5L13 3.5V9ZM6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z" fill="currentColor"/></svg>, badge: unreadApplicationCount, onClick: handleApplicationsClick },
    { path: '/recruiter/dashboard/Analytics', label: 'Analytics', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13H9V21H3V13ZM11 3H17V21H11V3ZM19 7H15V21H19V7Z" fill="currentColor"/></svg> },
  ];
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
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      return storedName;
    }
    return 'User';
  };
  if (isMobile && isMobileMenuOpen) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
       
        <div className="fixed top-0 left-0 h-full w-64 bg-white text-black z-50 shadow-lg transform transition-transform duration-300 border-r border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-700 text-white">
            <div className="flex items-center space-x-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7L12 12L22 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h1 className="text-lg font-semibold">JobFinder</h1>
                <p className="text-xs">Recruiter Portal</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-white hover:text-gray-300 hover:bg-blue-800 rounded"
            >
              ✕
            </button>
          </div>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(userProfile.firstName, userProfile.lastName, userProfile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-black truncate">
                  {getFullName(userProfile.firstName, userProfile.lastName, userProfile.name)}
                </h3>
                <p className="text-xs text-gray-600 truncate">{userProfile.email || 'user@company.com'}</p>
                {userProfile.company && (
                  <p className="text-xs text-gray-500 truncate mt-1">{userProfile.company}</p>
                )}
              </div>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  onClick={item.onClick || closeMobileMenu}
                  className={`flex items-center px-4 py-2 rounded transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-green-100 hover:text-black'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute top-2 right-4 bg-red-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/></svg>
              <span className="font-medium text-sm ml-3">Logout</span>
            </button>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-30 p-2 bg-white text-black rounded shadow hover:bg-gray-100 border border-gray-200"
        >
          ☰
        </button>
      )}
      <div className={`fixed top-0 left-0 h-full bg-white text-black transition-all duration-300 z-10 shadow-lg border-r border-gray-200 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-700 text-white">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7L12 12L22 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h1 className="text-lg font-semibold">JobFinder</h1>
                <p className="text-xs">Recruiter Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 text-white hover:text-gray-300 hover:bg-blue-800 rounded"
          >
            {isCollapsed ? '☰' : '✕'}
          </button>
        </div>
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(userProfile.firstName, userProfile.lastName, userProfile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-black truncate">
                  {getFullName(userProfile.firstName, userProfile.lastName, userProfile.name)}
                </h3>
                <p className="text-xs text-gray-600 truncate">{userProfile.email || 'user@company.com'}</p>
                {userProfile.company && (
                  <p className="text-xs text-gray-500 truncate mt-1">{userProfile.company}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="p-2 border-b border-gray-200 bg-white flex justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {getInitials(userProfile.firstName, userProfile.lastName, userProfile.name)}
            </div>
          </div>
        )}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.path} className="relative group">
              <Link
                to={item.path}
                onClick={item.onClick}
                className={`flex items-center px-4 py-2 rounded transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-black hover:bg-green-100 hover:text-black'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="mr-3">{item.icon}</span>
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                {item.badge > 0 && (
                  <span className="absolute top-2 right-4 bg-red-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
              {isCollapsed && item.badge > 0 && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                  {item.label} ({item.badge})
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded transition-colors duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/></svg>
            {!isCollapsed && <span className="font-medium text-sm ml-3">Logout</span>}
           
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
export default RecruiterSidebar;