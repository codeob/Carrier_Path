import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const RecruiterAuth = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const url = isLogin
        ? "http://localhost:5040/api/recruiter/login"
        : "http://localhost:5040/api/recruiter/signup";

      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.recruiter.name);
      localStorage.setItem("role", "recruiter");

      setTimeout(() => {
        setIsLoading(false);
        navigate("/recruiter/dashboard");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  const handleSocialAuth = (provider) => {
    setIsLoading(true);
    console.log(`Auth with ${provider}`);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/recruiter/dashboard");
    }, 2000);
  };

  const PulseRingLoader = () => (
    <div className="fixed inset-0 bg-cover bg-center z-50 flex items-center justify-center">
      <motion.img
        src="https://i.pinimg.com/1200x/ac/31/d1/ac31d14c0df6c5a19a90ff4993bbf291.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-purple-200/60 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></div>
          <div className="absolute inset-[-8px] border-2 border-purple-400/30 rounded-full animate-ping"></div>
        </div>
        <div className="text-white text-lg sm:text-xl font-medium tracking-wider flex items-center space-x-1">
          <span>Loading</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
        <div className="text-purple-200 text-sm opacity-75">
          {isLogin ? "Signing you in..." : "Creating your account..."}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <motion.img
          src="https://i.pinimg.com/1200x/ac/31/d1/ac31d14c0df6c5a19a90ff4993bbf291.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 5, ease: "easeInOut" }}
        />
        <div className="relative bg-white bg-opacity-90 p-6 rounded-lg shadow-xl w-full max-w-sm">
          <h2 className="text-xl font-bold text-center mb-4">
            {isLogin ? "Recruiter Login" : "Recruiter Signup"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    {...register("company", { required: "Company is required" })}
                    className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? "Login" : "Signup"}
            </button>
          </form>
          <p className="mt-3 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
              className="text-blue-600 hover:underline ml-1 disabled:opacity-50"
            >
              {isLogin ? "Signup" : "Login"}
            </button>
          </p>
        </div>
      </div>
      {isLoading && <PulseRingLoader />}
    </>
  );
};

export default RecruiterAuth;