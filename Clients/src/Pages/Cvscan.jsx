// frontend/src/components/CvScan.js
// React component for the CV Scanner UI.
// Handles file upload, job description input, API calls, and result display.

import React, { useState } from 'react';
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { FaFileUpload, FaSearch, FaCheckCircle, FaExclamationTriangle, FaStar, FaLightbulb, FaRocket, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CvScan = () => {
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      setCvFile(file);
      setError(null);
    } else {
      setError('Please upload a .pdf or .docx file.');
      setCvFile(null);
    }
  };

  const handleScan = async () => {
    if (!cvFile || !jobDescription) {
      setError('Please upload a CV file and provide a job description.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('cvFile', cvFile);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('https://carrier-path.onrender.com/api/cvscanner/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results from server');
      }

      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to scan. Ensure the server is running and try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setCvFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
    // Clear the file input
    const fileInput = document.getElementById('cv-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-6 shadow-lg">
            <FaRocket className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            CV Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Optimize your CV for tech industry jobs. Upload your resume and get instant feedback with AI-powered analysis.
          </p>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">AI-Powered</div>
              <div className="text-gray-600">Analysis</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Instant</div>
              <div className="text-gray-600">Results</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Detailed</div>
              <div className="text-gray-600">Feedback</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">95%</div>
              <div className="text-gray-600">Accuracy</div>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
              <span className="text-green-500">🤖</span>
              <span className="text-sm font-medium text-gray-700">AI Technology</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
              <span className="text-blue-500">⚡</span>
              <span className="text-sm font-medium text-gray-700">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
              <span className="text-purple-500">🎯</span>
              <span className="text-sm font-medium text-gray-700">Job-Specific</span>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* File Upload Section */}
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaFileUpload className="text-green-500 text-xl" />
                <h3 className="text-xl font-semibold text-gray-900">Upload Your CV</h3>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="text-gray-500 mb-2">
                    <FaFileUpload className="mx-auto text-4xl mb-2" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PDF or DOCX (max 10MB)</p>
                  </div>
                </label>
                {cvFile && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-700 text-sm flex items-center">
                      <FaCheckCircle className="mr-2" />
                      {cvFile.name}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Job Description Section */}
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaSearch className="text-teal-500 text-xl" />
                <h3 className="text-xl font-semibold text-gray-900">Job Description</h3>
              </div>
              <textarea
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none shadow-sm"
                placeholder="Paste the job description here to analyze your CV against it..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={handleScan}
              disabled={isLoading || !cvFile || !jobDescription}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                isLoading || !cvFile || !jobDescription
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <FaSearch className="mr-3" />
                  Scan My CV
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaRedo className="mr-3" />
              Refresh
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">Scan Results</h2>
              <p className="text-gray-600">Here's how your CV performs against the job requirements</p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl text-center border border-green-100 shadow-sm"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-2">{result.keywordMatch}</div>
                <div className="text-sm text-green-700 font-medium">Keyword Match</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-xl text-center border border-teal-100 shadow-sm"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent mb-2">{result.structureScore}</div>
                <div className="text-sm text-teal-700 font-medium">Structure Score</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl text-center border border-emerald-100 shadow-sm"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">{result.readabilityScore}</div>
                <div className="text-sm text-emerald-700 font-medium">Readability Score</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl text-center border border-cyan-100 shadow-sm"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-2">{result.overallScore}</div>
                <div className="text-sm text-cyan-700 font-medium">Overall Score</div>
              </motion.div>
            </div>

            {/* Detailed Results */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Keywords Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    Matched Keywords
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-700">
                      {result.matchedKeywords.length > 0
                        ? result.matchedKeywords.join(', ')
                        : 'No keywords matched'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-2" />
                    Missing Keywords
                  </h4>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700">
                      {result.missingKeywords.length > 0
                        ? result.missingKeywords.join(', ')
                        : 'All keywords matched!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaStar className="text-blue-500 mr-2" />
                    Matched Hard Skills
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-700">
                      {result.matchedHardSkills.length > 0
                        ? result.matchedHardSkills.join(', ')
                        : 'No hard skills matched'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaStar className="text-purple-500 mr-2" />
                    Matched Soft Skills
                  </h4>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-700">
                      {result.matchedSoftSkills.length > 0
                        ? result.matchedSoftSkills.join(', ')
                        : 'No soft skills matched'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stand-Out Achievements */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FaRocket className="text-orange-500 mr-2" />
                Stand-Out Achievements
              </h4>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-700">
                  {result.standOutPoints.length > 0
                    ? result.standOutPoints.join(', ')
                    : 'No standout achievements identified'}
                </p>
              </div>
            </div>

            {/* Feedback and Solutions */}
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaLightbulb className="text-yellow-500 mr-2" />
                  Feedback
                </h4>
                <div className="space-y-3">
                  {result.feedback.map((f, i) => (
                    <div key={i} className="bg-yellow-50 p-4 rounded-lg">
                      <strong className="text-yellow-800">{f.section}:</strong>
                      <p className="text-yellow-700 mt-1">{f.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  Solutions
                </h4>
                <div className="space-y-3">
                  {result.solutions.map((s, i) => (
                    <div key={i} className="bg-green-50 p-4 rounded-lg">
                      <strong className="text-green-800">{s.section}:</strong>
                      <p className="text-green-700 mt-1">{s.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CvScan;