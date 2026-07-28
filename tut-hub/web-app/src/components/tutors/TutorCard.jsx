import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, ExternalLink } from 'lucide-react';

export const TutorCard = ({ tutor }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <div className="aspect-[4/3] relative">
        <img 
          src={tutor.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.id}`} 
          alt={tutor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 text-sm font-bold">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="dark:text-white">{tutor.rating}</span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold dark:text-white">{tutor.name}</h3>
          <span className="text-blue-600 font-bold">${tutor.priceMin}/hr</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tutor.subjects?.slice(0, 3).map((subject) => (
            <span key={subject} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-md">
              {subject}
            </span>
          ))}
          {tutor.subjects?.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs font-medium rounded-md">
              +{tutor.subjects.length - 3} more
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {tutor.locationText} ({tutor.teachingMode})
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Flexible availability
          </div>
        </div>

        <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition flex items-center justify-center">
          View Profile <ExternalLink className="w-4 h-4 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};
