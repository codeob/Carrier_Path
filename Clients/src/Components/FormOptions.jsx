import { motion } from 'framer-motion';
import { FaUserTie, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

// Animation variants for the buttons
const buttonVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2, // Staggered delay for each button
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const FormOption = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-rose-100 to-purple-100">
      {/* Animated Background Image */}
      <motion.img
        src="https://i.pinimg.com/1200x/ac/31/d1/ac31d14c0df6c5a19a90ff4993bbf291.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: 'easeInOut' }} // Removed repeat and repeatType
      />
      
      {/* Animated Content Container */}
      <motion.div
        className="relative z-10 bg-white bg-opacity-90 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md sm:max-w-lg md:max-w-2xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-gray-900 mb-3 sm:mb-4">
          Welcome to Our Platform
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-xs sm:max-w-md md:max-w-lg mx-auto">
          Discover opportunities or connect with top talent. Select your role to get started.
        </p>

        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          {/* Recruiter Button */}
          <motion.button
            className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-md shadow-md transition-colors duration-300 text-sm sm:text-base"
            variants={buttonVariants}
            custom={0} // First button, no delay
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUserTie className="text-lg sm:text-xl" />
            <Link to="/recruiter/signup" className="flex items-center gap-2">
              <span>Recruiter Signup/Login</span>
            </Link>
          </motion.button>

          {/* User Button */}
          <motion.button
            className="flex items-center justify-center gap-2 sm:gap-3 bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-md shadow-md transition-colors duration-300 text-sm sm:text-base"
            variants={buttonVariants}
            custom={1} // Second button, delayed
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUser className="text-lg sm:text-xl" />
            <Link to="jobseeker/signup" className="flex items-center gap-2">
              <span>JobSeeker Signup/Login</span>
            </Link>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FormOption;