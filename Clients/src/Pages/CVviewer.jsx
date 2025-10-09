import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CVviewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    if(location.state?.application) {
      setApplication(location.state.application);
    } else {
      navigate('/recruiter/dashboard/applications');
    }
  }, [location.state, navigate]);

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 lg:px-8 pt-20 pb-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 lg:px-8 pt-20 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                CV Viewer
              </h1>
              <p className="text-gray-600">Review {application.fullName}'s structured CV and application details</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/recruiter/dashboard/applications')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-600 transition duration-200 shadow-md"
            >
              ← Back to Applications
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Structured CV Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicant Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Name:</span> {application.fullName}</p>
                  <p><span className="font-medium">Email:</span> {application.email}</p>
                  {application.portfolioLink && (
                    <p><span className="font-medium">Portfolio:</span> <a href={application.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.portfolioLink}</a></p>
                  )}
                  {application.githubLink && (
                    <p><span className="font-medium">GitHub:</span> <a href={application.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.githubLink}</a></p>
                  )}
                </div>
              </div>

              {application.userId?.skills && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {application.userId.skills.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {application.message && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{application.message}</p>
                  </div>
                </div>
              )}

              {application.ats && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ATS Analysis</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Overall Score:</span> {application.ats.overallScore}%</p>
                    {/* Add more ATS details if available */}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Resume PDF Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Document</h2>
            {application.resume ? (
              <iframe
                src={`https://carrier-path.onrender.com${application.resume}`}
                className="w-full h-[600px] border border-gray-200 rounded-lg"
                title="Resume Preview"
              />
            ) : (
              <div className="w-full h-[600px] border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No resume uploaded
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
