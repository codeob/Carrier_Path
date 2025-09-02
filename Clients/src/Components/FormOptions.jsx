import { motion } from 'framer-motion';
import { FaUserTie, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function FormOption() {
  const bgUrl = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop';

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background with dark gradient overlay to match hero */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.65)), url(${bgUrl})` }}
        />
        {/* Animated blobs (match hero styling) */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-400/30 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl"
          animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] lg:min-h-screen py-14 sm:py-16 md:py-20 flex flex-col items-center justify-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Heading directly on image */}
          <motion.h1
            variants={item}
            className="text-white drop-shadow-2xl text-3xl min-[320px]:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl"
          >
            Choose Your Path
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-3 sm:mt-4 text-gray-100 drop-shadow text-base sm:text-lg md:text-xl max-w-2xl"
          >
            Whether you are hiring top talent or looking for your next opportunity, start the journey that fits you.
          </motion.p>

          {/* Subtle mobile-only gradient behind text for readability */}
          <div className="pointer-events-none absolute inset-x-0 top-24 sm:hidden bg-gradient-to-b from-transparent via-black/20 to-black/30 h-40" />

          {/* Options grid */}
          <motion.div
            variants={containerVariants}
            className="mt-8 sm:mt-10 grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Recruiter Card */}
            <motion.div
              variants={item}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-xl overflow-hidden"
            >
              {/* Accent gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-green-500/10 via-teal-500/10 to-cyan-500/10" />
              <Link to="/recruiter/signup" className="relative block p-6 sm:p-7 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-lg ring-1 ring-white/20">
                    <FaUserTie className="text-xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-lg sm:text-xl">Recruiter</h3>
                    <p className="text-gray-200 text-sm sm:text-base mt-1 max-w-[28ch]">
                      Post jobs, manage applications, and connect with top candidates.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500 px-5 py-2 text-white text-sm font-semibold shadow-lg group-hover:shadow-xl">
                    Continue
                  </span>
                  <span className="text-white/80 text-sm">It’s fast and free</span>
                </div>
              </Link>
            </motion.div>

            {/* JobSeeker Card */}
            <motion.div
              variants={item}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-green-500/10 via-teal-500/10 to-cyan-500/10" />
              <Link to="/jobseeker/signup" className="relative block p-6 sm:p-7 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-lg ring-1 ring-white/20">
                    <FaUser className="text-xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-lg sm:text-xl">Job Seeker</h3>
                    <p className="text-gray-200 text-sm sm:text-base mt-1 max-w-[28ch]">
                      Explore jobs, analyze your CV, and apply confidently.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500 px-5 py-2 text-white text-sm font-semibold shadow-lg group-hover:shadow-xl">
                    Continue
                  </span>
                  <span className="text-white/80 text-sm">No credit card required</span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default FormOption;
