// frontend/src/components/CvScan.js
// React component for the CV Scanner UI.
// Handles file upload, job description input, API calls, and result display.

import React, { useState } from 'react';

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
      const response = await fetch('http://localhost:5040/api/cvscanner/scan', {
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Tech Industry CV Scanner</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Upload CV (.pdf or .docx)</label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="border w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Job Description</label>
        <textarea
          className="border w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleScan}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-md text-white transition ${
          isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Scanning...' : 'Scan CV'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-white rounded-md shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Scan Results:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <p><strong>Keyword Match:</strong> {result.keywordMatch}</p>
            <p><strong>Structure Score:</strong> {result.structureScore}</p>
            <p><strong>Readability Score:</strong> {result.readabilityScore}</p>
            <p><strong>Overall Score:</strong> {result.overallScore}</p>
          </div>
          <h4 className="font-semibold mb-2 text-gray-700">Matched Keywords:</h4>
          <p className="mb-3 text-gray-600">{result.matchedKeywords.join(', ') || 'None'}</p>
          <h4 className="font-semibold mb-2 text-gray-700">Missing Keywords:</h4>
          <p className="mb-3 text-gray-600">{result.missingKeywords.join(', ') || 'None'}</p>
          <h4 className="font-semibold mb-2 text-gray-700">Matched Hard Skills:</h4>
          <p className="mb-3 text-gray-600">{result.matchedHardSkills.join(', ') || 'None'}</p>
          <h4 className="font-semibold mb-2 text-gray-700">Matched Soft Skills:</h4>
          <p className="mb-3 text-gray-600">{result.matchedSoftSkills.join(', ') || 'None'}</p>
          <h4 className="font-semibold mb-2 text-gray-700">Stand-Out Achievements:</h4>
          <p className="mb-3 text-gray-600">{result.standOutPoints.join(', ') || 'None'}</p>
          <h4 className="font-semibold mb-2 text-gray-700">Feedback:</h4>
          <ul className="list-disc ml-6 mb-4 text-gray-600">
            {result.feedback.map((f, i) => (
              <li key={i} className="mb-2">
                <strong>{f.section}:</strong> {f.message}
              </li>
            ))}
          </ul>
          <h4 className="font-semibold mb-2 text-gray-700">Solutions:</h4>
          <ul className="list-disc ml-6 text-gray-600">
            {result.solutions.map((s, i) => (
              <li key={i} className="mb-2">
                <strong>{s.section}:</strong> {s.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CvScan;