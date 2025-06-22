import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import cherry from '../assets/cherry.jpg'; // ✅ Background image

export default function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 8px 24px rgba(244, 114, 182, 0.3)' },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden font-sans text-white bg-fixed bg-center bg-cover"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${cherry})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 px-6 py-24 text-center"
        variants={itemVariants}
      >
        <motion.h1
          className="text-5xl font-extrabold tracking-wide text-pink-200 md:text-6xl"
          variants={itemVariants}
        >
          Lone Town
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto mt-4 text-lg leading-relaxed text-gray-100 md:text-xl"
          variants={itemVariants}
        >
          One intentional match a day. No swiping. Just serene, mindful connections.
        </motion.p>
        <motion.button
          onClick={() => navigate('/login')} // ✅ Updated to login
          className="px-8 py-4 mt-8 font-semibold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-4 focus:ring-pink-300"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Find Your Match
        </motion.button>
      </motion.section>

      {/* How It Works */}
      <motion.section className="relative z-10 px-8 py-20" variants={containerVariants}>
        <motion.h2
          className="mb-12 text-3xl font-bold text-center text-pink-200 md:text-4xl"
          variants={itemVariants}
        >
          How It Works
        </motion.h2>
        <motion.div
          className="grid max-w-5xl gap-8 mx-auto md:grid-cols-3"
          variants={containerVariants}
        >
          {[
            {
              title: 'Daily Match',
              desc: 'Receive one curated match under cherry blossom skies.',
              image: '/cherry-blossom-profile1.jpg',
            },
            {
              title: 'Meaningful Chats',
              desc: 'Connect deeply with video after 100 messages.',
              image: '/cherry-blossom-profile2.jpg',
            },
            {
              title: 'Reflect & Grow',
              desc: 'Pause to reflect with nature’s calm guidance.',
              image: '/cherry-blossom-profile3.jpg',
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="p-6 transition-all duration-300 bg-black shadow-lg bg-opacity-70 rounded-xl hover:bg-opacity-80"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={step.image}
                alt={step.title}
                className="object-cover w-full h-48 mb-4 rounded-t-xl"
              />
              <h3 className="text-xl font-semibold text-pink-200">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-300">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Why Lone Town */}
      <motion.section className="relative z-10 px-8 py-20 bg-black bg-opacity-60" variants={containerVariants}>
        <motion.h2
          className="mb-12 text-3xl font-bold text-center text-pink-200 md:text-4xl"
          variants={itemVariants}
        >
          Why Lone Town?
        </motion.h2>
        <motion.div
          className="grid max-w-4xl gap-6 mx-auto md:grid-cols-2"
          variants={containerVariants}
        >
          {[
            {
              title: 'Exclusive Matching',
              desc: 'One match at a time, like a rare blossom.',
              image: '/cherry-blossom-profile4.jpg',
            },
            {
              title: 'Reflection Pause',
              desc: 'A 24-hour break to bloom with insight.',
              image: '/cherry-blossom-profile5.jpg',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center p-4 space-x-4 transition-all duration-300 bg-pink-900 rounded-lg shadow-md bg-opacity-70 hover:bg-opacity-80"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="object-cover w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold text-pink-200">{feature.title}</h3>
                <p className="mt-1 text-gray-300">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 px-4 py-6 text-center text-gray-300 bg-pink-900"
        variants={itemVariants}
      >
        Lone Town © {new Date().getFullYear()} — Embracing love under cherry blossoms 🌸
      </motion.footer>
    </motion.div>
  );
}