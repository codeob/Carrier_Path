import { Link, useNavigate } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  // isOpen controls the notifications dropdown
  const [isOpen, setIsOpen] = useState(false);
  // mobileOpen controls the mobile nav menu
  const [mobileOpen, setMobileOpen] = useState(false);
  // jobs for notifications
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://carrier-path.onrender.com/api/jobs/public?recent=1&limit=5&sortBy=createdAt&sortOrder=desc');
        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error('Failed to fetch recent jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentJobs();
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-lg shadow-black/10 border-b border-gray-100"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: brand + mobile toggler */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleMobile}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: mobileOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileOpen ? (
                  // Close icon
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Hamburger icon
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                  </svg>
                )}
              </motion.div>
            </motion.button>

            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hover:from-green-700 hover:to-teal-700 transition-all duration-300">
              Jobfinder
            </Link>
          </div>

          {/* Center: desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/" className="relative px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="#about" className="relative px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/Cvscan" className="relative px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 group">
                CV Scan
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="#contact" className="relative px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </motion.div>
          </nav>

          {/* Right: actions */}
          <div className="relative flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/form"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Register
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={toggleOpen}
              aria-label="Notifications"
              aria-expanded={isOpen}
              className="relative rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
            >
              <FaRegBell className="text-xl text-gray-700" />
              {jobs.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
                >
                  {jobs.length}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50 max-h-96 overflow-y-auto border border-gray-100"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
                      <span className="mr-2">🚀</span>
                      New Job Postings
                    </h3>
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading...</span>
                      </div>
                    ) : jobs.length > 0 ? (
                      <div className="space-y-4">
                        {jobs.map((job, index) => (
                          <motion.div
                            key={job._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                          >
                            <div className="text-sm font-semibold text-gray-900 mb-1">{job.title}</div>
                            <div className="text-xs text-gray-600 mb-3">
                              By {job.postedBy?.name || 'Unknown'} at {job.companyName}
                            </div>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate('/form', {
                                  state: {
                                    message: `🌟 Exciting opportunity! Sign up or log in now to apply for this amazing job at ${job.companyName}. Don't miss out! 🚀✨`
                                  }
                                });
                              }}
                              className="text-xs bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-teal-600 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              View Job
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">📭</div>
                        <div className="text-sm text-gray-600">No new jobs posted yet.</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
          >
            <nav className="space-y-2 px-4 py-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link onClick={() => setMobileOpen(false)} to="/" className="block rounded-lg px-3 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-all duration-200">
                  Home
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a onClick={() => setMobileOpen(false)} href="#about" className="block rounded-lg px-3 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-all duration-200">
                  About
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link onClick={() => setMobileOpen(false)} to="/Cvscan" className="block rounded-lg px-3 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-all duration-200">
                  CV Scan
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a onClick={() => setMobileOpen(false)} href="#contact" className="block rounded-lg px-3 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-all duration-200">
                  Contact
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pt-2">
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/form"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Register
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
