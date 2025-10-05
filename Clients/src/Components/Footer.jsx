import React from 'react';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 mt-16 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {/* Brand Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Jobfinder
            </h3>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              Connecting talent with opportunity. Your career journey starts here with cutting-edge tools and personalized insights.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://x.com"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-slate-700 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-slate-700 hover:bg-teal-500 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </motion.a>
              <motion.a
                href="https://github.com"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-slate-700 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xl font-semibold mb-6 text-green-400">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  Job Matching
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  CV Analysis
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  Career Counseling
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  Interview Prep
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xl font-semibold mb-6 text-green-400">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xl font-semibold mb-6 text-green-400">Stay Updated</h4>
            <p className="text-slate-300 mb-4">Subscribe to get the latest job opportunities and career tips.</p>
            <div className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-white placeholder-slate-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-12 pt-8 border-t border-slate-700 text-center"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Jobfinder. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-slate-400">
              <span>Made with ❤️ for job seekers</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;