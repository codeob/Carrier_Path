import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)",
  "Congo (Kinshasa)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti",
  "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Nauru", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const workTypes = ['remote', 'in-office', 'hybrid'];
const employmentTypes = ['full-time', 'part-time', 'contract', 'internship'];

const CreateJob = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const jobToEdit = location.state?.job;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/recruiter/auth');
    }

    if (jobToEdit) {
      setValue('title', jobToEdit.title || '');
      setValue('description', jobToEdit.description || '');
      setValue('yearsOfExperience', jobToEdit.yearsOfExperience || 0);
      setValue('tools', Array.isArray(jobToEdit.tools) ? jobToEdit.tools.join(', ') : '');
      setValue('requirements', Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join(', ') : '');
      setValue('location.country', jobToEdit.location?.country || '');
      setValue('location.state', jobToEdit.location?.state || '');
      setValue('location.city', jobToEdit.location?.city || '');
      setValue('jobType', jobToEdit.jobType || '');
      setValue('employmentType', jobToEdit.employmentType || '');
      setValue('salary.hourly', jobToEdit.salary?.hourly || '');
      setValue('salary.weekly', jobToEdit.salary?.weekly || '');
      setValue('salary.monthly', jobToEdit.salary?.monthly || '');
      setValue('salary.yearly', jobToEdit.salary?.yearly || '');
    }
  }, [navigate, jobToEdit, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/recruiter/auth');
        return;
      }

      const jobData = {
        ...data,
        requirements: data.requirements ? data.requirements.split(',').map(req => req.trim()).filter(req => req) : [],
        tools: data.tools ? data.tools.split(',').map(tool => tool.trim()).filter(tool => tool) : [],
        yearsOfExperience: Number(data.yearsOfExperience),
        salary: {
          hourly: data.salary.hourly ? Number(data.salary.hourly) : undefined,
          weekly: data.salary.weekly ? Number(data.salary.weekly) : undefined,
          monthly: data.salary.monthly ? Number(data.salary.monthly) : undefined,
          yearly: data.salary.yearly ? Number(data.salary.yearly) : undefined,
        },
        status: jobToEdit ? jobToEdit.status : 'draft',
      };

      const response = await axios({
        method: jobToEdit ? 'PUT' : 'POST',
        url: jobToEdit ? `http://localhost:5040/api/jobs/${jobToEdit._id}` : 'http://localhost:5040/api/jobs',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: jobData,
      });

      navigate('/recruiter/dashboard/JobList');
    } catch (err) {
      console.error('Error saving job:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setIsLoading(false);
    }
  };

  const PulseRingLoader = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200/60 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
          <div className="absolute inset-[-8px] border-2 border-blue-400/30 rounded-full animate-ping"></div>
        </div>
        <div className="text-white text-lg font-medium tracking-wider flex items-center space-x-1">
          <span>Saving Job</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
                {jobToEdit ? 'Edit Job' : 'Create New Job'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {jobToEdit ? 'Update job details and requirements' : 'Fill in the details to post a new job opportunity'}
              </p>
            </div>
            <button
              onClick={() => navigate('/recruiter/dashboard/JobList')}
              className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Back to Jobs
            </button>
          </div>
        </div>

        <div className="py-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-blue-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title', { required: 'Job title is required', maxLength: { value: 100, message: 'Title must be 100 characters or less' } })}
                    className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-blue-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    {...register('yearsOfExperience', { 
                      required: 'Years of experience is required', 
                      min: { value: 0, message: 'Must be 0 or greater' },
                      max: { value: 50, message: 'Must be 50 or less' }
                    })}
                    className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                    placeholder="e.g., 3"
                  />
                  {errors.yearsOfExperience && <p className="text-red-600 text-sm mt-1">{errors.yearsOfExperience.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-blue-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Description is required', maxLength: { value: 5000, message: 'Description must be 5000 characters or less' } })}
                  rows="6"
                  className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-4">Job Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="location.country" className="block text-sm font-medium text-blue-700 mb-2">
                      Country *
                    </label>
                    <select
                      id="location.country"
                      {...register('location.country', { required: 'Country is required' })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.location?.country && <p className="text-red-600 text-sm mt-1">{errors.location.country.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="location.state" className="block text-sm font-medium text-blue-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      id="location.state"
                      {...register('location.state', { required: 'State is required', maxLength: { value: 100, message: 'State must be 100 characters or less' } })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                      placeholder="e.g., California"
                    />
                    {errors.location?.state && <p className="text-red-600 text-sm mt-1">{errors.location.state.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="location.city" className="block text-sm font-medium text-blue-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="location.city"
                      {...register('location.city', { required: 'City is required', maxLength: { value: 100, message: 'City must be 100 characters or less' } })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                      placeholder="e.g., San Francisco"
                    />
                    {errors.location?.city && <p className="text-red-600 text-sm mt-1">{errors.location.city.message}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="tools" className="block text-sm font-medium text-blue-700 mb-2">
                    Required Tools & Technologies *
                  </label>
                  <input
                    type="text"
                    id="tools"
                    {...register('tools', { required: 'Tools are required', maxLength: { value: 500, message: 'Tools must be 500 characters or less' } })}
                    className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                    placeholder="React, Node.js, Python, MongoDB"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple tools with commas</p>
                  {errors.tools && <p className="text-red-600 text-sm mt-1">{errors.tools.message}</p>}
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-blue-700 mb-2">
                    Key Requirements *
                  </label>
                  <textarea
                    id="requirements"
                    {...register('requirements', { required: 'Requirements are required', maxLength: { value: 1000, message: 'Requirements must be 1000 characters or less' } })}
                    rows="4"
                    className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                    placeholder="Bachelor's degree, Strong communication skills, Team player"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple requirements with commas</p>
                  {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-blue-700 mb-2">
                    Work Arrangement *
                  </label>
                  <select
                    id="jobType"
                    {...register('jobType', { required: 'Work arrangement is required' })}
                    className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                  >
                    <option value="">Select Work Arrangement</option>
                    {workTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.jobType && <p className="text-red-600 text-sm mt-1">{errors.jobType.message}</p>}
                </div>

                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-blue-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    id="employmentType"
                    {...register('employmentType', { required: 'Employment type is required' })}
                    className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                  >
                    <option value="">Select Employment Type</option>
                    {employmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.employmentType && <p className="text-red-600 text-sm mt-1">{errors.employmentType.message}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-4">Salary (USD)</h3>
                <p className="text-xs text-gray-500 mb-4">Enter at least one salary type (optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="salary.hourly" className="block text-sm font-medium text-blue-700 mb-2">
                      Hourly
                    </label>
                    <input
                      type="number"
                      id="salary.hourly"
                      {...register('salary.hourly', { 
                        min: { value: 0, message: 'Salary must be positive' },
                        max: { value: 1000, message: 'Hourly salary must be reasonable' }
                      })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                      placeholder="e.g., 50"
                    />
                    {errors.salary?.hourly && <p className="text-red-600 text-sm mt-1">{errors.salary.hourly.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="salary.weekly" className="block text-sm font-medium text-blue-700 mb-2">
                      Weekly
                    </label>
                    <input
                      type="number"
                      id="salary.weekly"
                      {...register('salary.weekly', { 
                        min: { value: 0, message: 'Salary must be positive' },
                        max: { value: 10000, message: 'Weekly salary must be reasonable' }
                      })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                      placeholder="e.g., 2000"
                    />
                    {errors.salary?.weekly && <p className="text-red-600 text-sm mt-1">{errors.salary.weekly.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="salary.monthly" className="block text-sm font-medium text-blue-700 mb-2">
                      Monthly
                    </label>
                    <input
                      type="number"
                      id="salary.monthly"
                      {...register('salary.monthly', { 
                        min: { value: 0, message: 'Salary must be positive' },
                        max: { value: 100000, message: 'Monthly salary must be reasonable' }
                      })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                      placeholder="e.g., 6000"
                    />
                    {errors.salary?.monthly && <p className="text-red-600 text-sm mt-1">{errors.salary.monthly.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="salary.yearly" className="block text-sm font-medium text-blue-700 mb-2">
                      Yearly
                    </label>
                    <input
                      type="number"
                      id="salary.yearly"
                      {...register('salary.yearly', { 
                        min: { value: 0, message: 'Salary must be positive' },
                        max: { value: 10000000, message: 'Yearly salary must be reasonable' }
                      })}
                      className="w-full px-3 py-2 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white text-black"
                      placeholder="e.g., 75000"
                    />
                    {errors.salary?.yearly && <p className="text-red-600 text-sm mt-1">{errors.salary.yearly.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/dashboard/JobList')}
                  className="px-6 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {isLoading ? 'Saving...' : jobToEdit ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isLoading && <PulseRingLoader />}
    </div>
  );
};

export default CreateJob;