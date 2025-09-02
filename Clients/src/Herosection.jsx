import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Herosection() {
  // Background and collage images (replace with local assets if preferred)
  const bgUrl =
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop';
  const img1 =
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop';
  const img2 =
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop';
  const img3 =
    'https://i.pinimg.com/1200x/be/7c/40/be7c40100429e0f2876f0848d9536ffb.jpg';

  const container = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.12 },
    },
  };
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.65)), url(${bgUrl})`,
          }}
        />

        {/* Decorative animated blobs */}
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

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] lg:min-h-screen grid items-center gap-10 py-12 sm:py-16 md:py-20 lg:py-24 md:grid-cols-2">
          {/* Left column: copy directly over image (no container) */}
          <motion.div variants={container} initial="hidden" animate="visible" className="relative">
            <motion.h1
              variants={item}
              className="text-white drop-shadow-2xl text-3xl min-[320px]:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-2xl"
            >
              Find Your Next Role Faster
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-3 sm:mt-4 text-gray-100 drop-shadow text-base sm:text-lg md:text-xl max-w-2xl"
            >
              Discover curated opportunities, analyze your CV, and apply with confidence. Your dream job is closer than you think.
            </motion.p>

            <motion.div variants={item} className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/form"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500 px-6 py-3 text-white text-sm sm:text-base font-semibold shadow-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-slate-900"
              >
                Get Started
              </Link>
            </motion.div>

            {/* subtle gradient behind text for readability on small screens (no container) */}
            <div className="pointer-events-none absolute -inset-x-4 -inset-y-6 sm:hidden bg-gradient-to-b from-transparent via-black/20 to-black/30" />

            {/* Quick stats */}
            <motion.div variants={item} className="relative mt-6 sm:mt-8 grid grid-cols-3 gap-4 max-w-md text-center">
              <div className="rounded-lg bg-black/25 p-3 sm:p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-white">10k+</div>
                <div className="text-xs sm:text-sm text-gray-200">Jobs</div>
              </div>
              <div className="rounded-lg bg-black/25 p-3 sm:p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-white">5k+</div>
                <div className="text-xs sm:text-sm text-gray-200">Companies</div>
              </div>
              <div className="rounded-lg bg-black/25 p-3 sm:p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-white">95%</div>
                <div className="text-xs sm:text-sm text-gray-200">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column: image collage (hidden on small screens for clarity) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="relative hidden md:block"
          >
            <div className="relative mx-auto h-[420px] w-[90%] max-w-[520px]">
              {/* Card 1 */}
              <img
                src={img1}
                alt="Collaborating professionals"
                className="absolute left-0 top-0 h-60 w-44 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 rotate-[-8deg]"
              />
              {/* Card 2 */}
              <img
                src={img2}
                alt="Team at work"
                className="absolute right-4 top-10 h-64 w-48 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 rotate-[8deg]"
              />
              {/* Card 3 */}
              <img
                src={img3}
                alt="Developer workspace"
                className="absolute left-16 bottom-0 h-64 w-56 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 rotate-[4deg]"
              />

              {/* glow */}
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-green-400/10 via-teal-400/10 to-cyan-400/10 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Herosection;
