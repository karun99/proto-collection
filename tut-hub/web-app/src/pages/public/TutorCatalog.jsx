import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { TutorCard } from '../../components/tutors/TutorCard';
import { supabase } from '../../lib/supabase';

const MOCK_TUTORS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    subjects: ['Mathematics', 'Calculus', 'Physics'],
    locationText: 'Remote',
    teachingMode: 'online',
    priceMin: 45,
    rating: 4.9,
    profileImageUrl: null,
  },
  {
    id: 2,
    name: 'Michael Chen',
    subjects: ['Computer Science', 'Python', 'Web Development'],
    locationText: 'San Francisco, CA',
    teachingMode: 'hybrid',
    priceMin: 60,
    rating: 4.8,
    profileImageUrl: null,
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    subjects: ['Spanish', 'Literature', 'History'],
    locationText: 'Austin, TX',
    teachingMode: 'in-person',
    priceMin: 35,
    rating: 5.0,
    profileImageUrl: null,
  },
  {
    id: 4,
    name: 'David Wilson',
    subjects: ['Chemistry', 'Biology', 'Science'],
    locationText: 'Remote',
    teachingMode: 'online',
    priceMin: 40,
    rating: 4.7,
    profileImageUrl: null,
  }
];

export const TutorCatalog = () => {
  const [tutors, setTutors] = useState(MOCK_TUTORS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    async function fetchTutors() {
      try {
        const { data, error } = await supabase
          .from('tutors')
          .select('*');
        
        if (error) throw error;
        if (data && data.length > 0) {
          setTutors(data);
        }
      } catch (err) {
        console.warn('Could not fetch from Supabase, using mock data:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTutors();
  }, []);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.subjects?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || tutor.subjects?.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold dark:text-white mb-4">Find Your Perfect Tutor</h1>
        <p className="text-gray-600 dark:text-gray-400">Discover expert educators tailored to your learning needs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or subject..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Spanish">Spanish</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white hover:bg-gray-50 transition">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading expert tutors...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>

          {filteredTutors.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No tutors found matching your criteria.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedSubject('All');}}
                className="text-blue-600 mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
