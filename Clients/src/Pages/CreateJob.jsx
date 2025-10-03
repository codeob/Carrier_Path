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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            {jobToEdit ? 'Edit Job Listing' : 'Create New Job Listing'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                {...register('companyName', { required: 'Company name is required' })}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.companyName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="companyImage" className="block text-sm font-medium text-gray-700">
                Company Logo (Optional)
              </label>
              <input
                id="companyImage"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                {...register('companyImage')}
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Company logo preview" className="w-32 h-32 object-contain rounded-lg border border-gray-200" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Job title is required' })}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter job title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <textarea
                id="description"
                {...register('description', { required: 'Job description is required' })}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                rows="5"
                placeholder="Describe the job responsibilities and requirements"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                {...register('yearsOfExperience', {
                  required: 'Years of experience is required',
                  min: { value: 0, message: 'Years of experience cannot be negative' },
                })}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.yearsOfExperience ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter required years of experience"
              />
              {errors.yearsOfExperience && (
                <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="tools" className="block text-sm font-medium text-gray-700">
                Tools (comma-separated)
              </label>
              <input
                id="tools"
                type="text"
                {...register('tools')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., JavaScript, React, Node.js"
              />
              <p className="mt-1 text-sm text-gray-500">Optional: Enter tools separated by commas</p>
            </div>

            <div>
              <label htmlFor="requirements" className="block text sm font-medium text-gray-700">
                Requirements (comma-separated)
              </label>
              <input
                id="requirements"
                type="text"
                {...register('requirements')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Bachelor's degree, 3+ years in web development"
              />
              <p className="mt-1 text-sm text-gray-500">Optional: Enter requirements separated by commas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="location.country"
                  {...register('location.country', { required: 'Country is required' })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.location?.country ? 'border-red-300' : 'border-gray-300'
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
                  <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="location.state"
                  type="text"
                  {...register('location.state', { required: 'State is required' })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.location?.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter state"
                />
                {errors.location?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="location.city"
                  type="text"
                  {...register('location.city', { required: 'City is required' })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.location?.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
                Work Arrangement
              </label>
              <select
                id="jobType"
                {...register('jobType', { required: 'Work arrangement is required' })}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.jobType ? 'border-red-300' : 'border-gray-300'
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
                <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
                Employment Type
              </label>
              <select
                id="employmentType"
                {...register('employmentType', { required: 'Employment type is required' })}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.employmentType ? 'border-red-300' : 'border-gray-300'
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
                <p className="mt-1 text-sm text-red-600">{errors.employmentType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="salary.hourly" className="block text-sm font-medium text-gray-700">
                  Hourly Salary (Optional)
                </label>
                <input
                  id="salary.hourly"
                  type="number"
                  min="0"
                  {...register('salary.hourly')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter hourly salary"
                />
              </div>
              <div>
                <label htmlFor="salary.weekly" className="block text-sm font-medium text-gray-700">
                  Weekly Salary (Optional)
                </label>
                <input
                  id="salary.weekly"
                  type="number"
                  min="0"
                  {...register('salary.weekly')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter weekly salary"
                />
              </div>
              <div>
                <label htmlFor="salary.monthly" className="block text-sm font-medium text-gray-700">
                  Monthly Salary (Optional)
                </label>
                <input
                  id="salary.monthly"
                  type="number"
                  min="0"
                  {...register('salary.monthly')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter monthly salary"
                />
              </div>
              <div>
                <label htmlFor="salary.yearly" className="block text-sm font-medium text-gray-700">
                  Yearly Salary (Optional)
                </label>
                <input
                  id="salary.yearly"
                  type="number"
                  min="0"
                  {...register('salary.yearly')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter yearly salary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/recruiter/dashboard/JobList')}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`py-2 px-4 rounded-lg transition duration-200 ${
                  isLoading
                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } flex items-center gap-2`}
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
        </div>
      </div>

      {isLoading && (
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
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateJob;
