import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, PenTool, BrainCircuit, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
            >
              Connect with <span className="text-blue-600">Expert Tutors</span> <br /> 
              Elevate Your Learning
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              The all-in-one platform for tutors to manage their business and for students to find the perfect mentor. AI-powered tools, digital resources, and seamless discovery.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center space-x-4"
            >
              <Link to="/tutors" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Find a Tutor
              </Link>
              <Link to="/login" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition">
                Become a Tutor
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full blur-3xl -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400 rounded-full blur-3xl -ml-64 -mb-64" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold dark:text-white">Why Choose TutorConnect?</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Everything you need to succeed in one place.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="w-8 h-8 text-blue-500" />}
              title="Smart Discovery"
              description="Find tutors by subject, location, teaching mode, and price. Verified reviews ensure quality."
            />
            <FeatureCard 
              icon={<BrainCircuit className="w-8 h-8 text-purple-500" />}
              title="AI Quiz Generation"
              description="Tutors can generate custom quizzes instantly using advanced AI models like GPT-4 and Claude."
            />
            <FeatureCard 
              icon={<PenTool className="w-8 h-8 text-green-500" />}
              title="Flyer Creator"
              description="Create stunning marketing flyers for your classes with our built-in digital design tools."
            />
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8 text-orange-500" />}
              title="Ebook Management"
              description="Buy and sell learning resources directly on the platform with built-in PDF reading."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-cyan-500" />}
              title="Global Reach"
              description="Connect with students worldwide or find local experts right in your neighborhood."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-red-500" />}
              title="Secure Platform"
              description="Robust security, encrypted data, and verified tutor profiles for a safe learning environment."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);
