import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from '../Components/RecruiterSidebar';
import { FaBars } from 'react-icons/fa';

function RecruiterDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex">
      <RecruiterSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col">
        {/* Hamburger Menu for Mobile Screens */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="text-blue-600 text-xl hover:text-blue-500 transition-colors duration-200"
            aria-label={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            <FaBars />
          </button>
          <h1 className="text-xs font-bold text-blue-500">JobFinder Recruiter Portal</h1>
        </div>
        {/* Main Content */}
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 xl:ml-64 transition-all duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;