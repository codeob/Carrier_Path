import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function About() {
  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-500 ease-in-out mt-16" id='about'>
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            >
              About Job Portal
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
            >
              Connecting talented job seekers with forward-thinking recruiters through 
              innovative technology and seamless user experience.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Your Gateway to Career Success
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Job Portal is designed to bridge the gap between exceptional talent and great opportunities. 
              Whether you're a recruiter looking for the perfect candidate or a job seeker ready for your next adventure, 
              we've got you covered.
            </p>
          </motion.div>

          {/* Two Column Layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16"
          >
            {/* For Recruiters */}
            <motion.div
              variants={scaleIn}
              whileHover={{ rotate: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  For Recruiters
                </h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  Streamline your hiring process with powerful tools
                </p>
              </div>

              <motion.div variants={staggerContainer} className="space-y-6">
                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Easy Registration & Login</h4>
                    <p className="text-gray-600">
                      Quick signup process to get you started immediately. Secure login to access your dashboard anytime.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Create & Manage Jobs</h4>
                    <p className="text-gray-600">
                      Post job openings with detailed descriptions, requirements, and company information. 
                      Edit and manage all your listings from one central location.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Application Management</h4>
                    <p className="text-gray-600">
                      Review, filter, and manage applications from job seekers. 
                      Track candidate progress and make informed hiring decisions.
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Link to='/recruiter/signup'>Start Recruiting Today</Link>
                </motion.button>
              </div>
            </motion.div>

            {/* For Job Seekers */}
            <motion.div
              variants={scaleIn}
              whileHover={{ rotate: -1 }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V2a2 2 0 00-2-2H8a2 2 0 00-2 2v4m8 0H8m0 0v5.172a2 2 0 00.586 1.414l4 4a2 2 0 002.828 0l4-4a2 2 0 00.586-1.414V6z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  For Job Seekers
                </h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  Find your dream job with confidence and precision
                </p>
              </div>

              <motion.div variants={staggerContainer} className="space-y-6">
                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Simple Registration & Login</h4>
                    <p className="text-gray-600">
                      Create your profile in minutes and access thousands of job opportunities. 
                      Secure login to manage your applications and preferences.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Browse & Copy Job Descriptions</h4>
                    <p className="text-gray-600">
                      Explore detailed job listings and easily copy job descriptions for reference. 
                      Save interesting opportunities for later review.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">CV Scan & Match Analysis</h4>
                    <p className="text-gray-600">
                      Use our innovative CV scan feature to compare your resume against job requirements. 
                      Get insights on how well you match and apply with confidence.
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                <Link to='/jobseeker/signup'>Start Your Job Search</Link>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-16 sm:mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Job Portal?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                We're committed to making the job search and recruitment process as smooth and effective as possible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
              <motion.div variants={fadeInUp} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
                <p className="text-gray-600">
                  Streamlined processes that save time for both recruiters and job seekers.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-gray-600">
                  AI-powered CV scanning helps match the right candidates with the right opportunities.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Your data and privacy are protected with industry-standard security measures.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-gray-900 text-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful recruiters and job seekers who have found their perfect match through Job Portal.
          </p>
          <motion.div
            variants={staggerContainer}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
          >
            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              <Link to='/recruiter/signup'>Sign Up as Recruiter</Link>
            </motion.button>
            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
             <Link to='/jobseeker/auth'>Sign Up as Job Seeker</Link>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default About;