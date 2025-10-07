import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';

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
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
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
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const jobToEdit = location.state?.job;

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/recruiter/auth');
        return;
      }
      try {
        await axios.get('https://carrier-path.onrender.com/api/recruiter/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        if (e?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/recruiter/auth');
          return;
        }
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
        setValue('companyName', jobToEdit.companyName || '');
        if (jobToEdit.companyImage) {
          setImagePreview(`https://carrier-path.onrender.com${jobToEdit.companyImage}`);
        }
      }
    };
    verify();
  }, [navigate, jobToEdit, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only JPEG, JPG, or PNG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setError('');
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    if (isLoading) return; // prevent double click submissions
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/recruiter/auth');
        return;
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('yearsOfExperience', Number(data.yearsOfExperience));
      formData.append('tools', JSON.stringify(data.tools ? data.tools.split(',').map(tool => tool.trim()).filter(tool => tool) : []));
      formData.append('requirements', JSON.stringify(data.requirements ? data.requirements.split(',').map(req => req.trim()).filter(req => req) : []));
      formData.append('location', JSON.stringify({
        country: data.location.country,
        state: data.location.state,
        city: data.location.city,
      }));
      formData.append('jobType', data.jobType);
      formData.append('employmentType', data.employmentType);
      formData.append('salary', JSON.stringify({
        hourly: data.salary.hourly ? Number(data.salary.hourly) : undefined,
        weekly: data.salary.weekly ? Number(data.salary.weekly) : undefined,
        monthly: data.salary.monthly ? Number(data.salary.monthly) : undefined,
        yearly: data.salary.yearly ? Number(data.salary.yearly) : undefined,
      }));
      formData.append('companyName', data.companyName);

      if (data.companyImage && data.companyImage[0]) {
        formData.append('companyImage', data.companyImage[0]);
      }

      if (jobToEdit) {
        formData.append('status', jobToEdit.status);
      }

      await axios({
        method: jobToEdit ? 'PUT' : 'POST',
        url: jobToEdit ? `https://carrier-path.onrender.com/api/jobs/${jobToEdit._id}` : 'https://carrier-path.onrender.com/api/jobs',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
      });

      setSuccess(jobToEdit ? 'Job updated successfully!' : 'Job created successfully!');
      reset();
      setImagePreview(null);
      setTimeout(() => {
        navigate('/recruiter/dashboard/JobList');
      }, 1500);
    } catch (err) {
      console.error('Error saving job:', err);
      if (err?.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/recruiter/auth'), 800);
      } else {
        setError(err.response?.data?.message || 'Failed to save job. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {jobToEdit ? 'Edit Job Listing' : 'Create New Job Listing'}
              </h1>
              <p className="text-slate-600 text-base mt-1">Fill in the details to post your job opportunity</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-lg">✅</span>
                <p className="text-emerald-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Company Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Company Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    {...register('companyName', { required: 'Company name is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.companyName ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.companyName.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="companyImage" className="block text-sm font-medium text-slate-700 mb-2">
                    Company Logo (Optional)
                  </label>
                  <input
                    id="companyImage"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    {...register('companyImage')}
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors"
                  />
                  {imagePreview && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <img src={imagePreview} alt="Company logo preview" className="w-32 h-32 object-contain rounded-lg border border-slate-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* Job Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Job Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title', { required: 'Job title is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                    placeholder="Enter job title"
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.title.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    {...register('description', { required: 'Job description is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                    rows="6"
                    placeholder="Describe the job responsibilities and requirements"
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.description.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    {...register('yearsOfExperience', {
                      required: 'Years of experience is required',
                      min: { value: 0, message: 'Years of experience cannot be negative' },
                    })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.yearsOfExperience ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                    placeholder="Enter required years of experience"
                  />
                  {errors.yearsOfExperience && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.yearsOfExperience.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-2">
                    Work Arrangement *
                  </label>
                  <select
                    id="jobType"
                    {...register('jobType', { required: 'Work arrangement is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.jobType ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <option value="">Select work arrangement</option>
                    {workTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.jobType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.jobType.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-slate-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    id="employmentType"
                    {...register('employmentType', { required: 'Employment type is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.employmentType ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <option value="">Select employment type</option>
                    {employmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.employmentType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.employmentType.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="tools" className="block text-sm font-medium text-slate-700 mb-2">
                    Tools & Technologies
                  </label>
                  <input
                    id="tools"
                    type="text"
                    {...register('tools')}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-colors"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                  <p className="mt-2 text-sm text-slate-500">Optional: Enter tools separated by commas</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="requirements" className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Requirements
                  </label>
                  <input
                    id="requirements"
                    type="text"
                    {...register('requirements')}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-colors"
                    placeholder="e.g., Bachelor's degree, 3+ years in web development"
                  />
                  <p className="mt-2 text-sm text-slate-500">Optional: Enter requirements separated by commas</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Location</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="location.country" className="block text-sm font-medium text-slate-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="location.country"
                    {...register('location.country', { required: 'Country is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.location?.country ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.location?.country && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.location.country.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.state" className="block text-sm font-medium text-slate-700 mb-2">
                    State *
                  </label>
                  <input
                    id="location.state"
                    type="text"
                    {...register('location.state', { required: 'State is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.location?.state ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.location?.state && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.location.state.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.city" className="block text-sm font-medium text-slate-700 mb-2">
                    City *
                  </label>
                  <input
                    id="location.city"
                    type="text"
                    {...register('location.city', { required: 'City is required' })}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.location?.city ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.location?.city && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {errors.location.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* Compensation Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Compensation</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="salary.hourly" className="block text-sm font-medium text-slate-700 mb-2">
                    Hourly Salary
                  </label>
                  <input
                    id="salary.hourly"
                    type="number"
                    min="0"
                    {...register('salary.hourly')}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-colors"
                    placeholder="Enter hourly salary"
                  />
                </div>
                <div>
                  <label htmlFor="salary.weekly" className="block text-sm font-medium text-slate-700 mb-2">
                    Weekly Salary
                  </label>
                  <input
                    id="salary.weekly"
                    type="number"
                    min="0"
                    {...register('salary.weekly')}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-colors"
                    placeholder="Enter weekly salary"
                  />
                </div>
                <div>
                  <label htmlFor="salary.monthly" className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Salary
                  </label>
                  <input
                    id="salary.monthly"
                    type="number"
                    min="0"
                    {...register('salary.monthly')}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-colors"
                    placeholder="Enter monthly salary"
                  />
                </div>
                <div>
                  <label htmlFor="salary.yearly" className="block text-sm font-medium text-slate-700 mb-2">
                    Yearly Salary
                  </label>
                  <input
                    id="salary.yearly"
                    type="number"
                    min="0"
                    {...register('salary.yearly')}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-colors"
                    placeholder="Enter yearly salary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/recruiter/dashboard/JobList')}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 ${
                  isLoading
                    ? 'bg-emerald-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105'
                }`}
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                    />
                  </svg>
                )}
                {jobToEdit ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-200/60 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse"></div>
              <div className="absolute inset-[-12px] border-2 border-emerald-400/30 rounded-full animate-ping"></div>
            </div>
            <div className="text-white text-xl font-semibold tracking-wider flex items-center space-x-2">
              <span>Saving Job</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateJob;
