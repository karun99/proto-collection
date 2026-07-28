import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, X, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const { settings, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {settings.platformName}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/tutors" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Find Tutors</Link>
            <Link to="/resources" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Resources</Link>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              {settings.themeMode === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Sign In
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/tutors" className="block px-3 py-2 text-gray-600 dark:text-gray-300">Find Tutors</Link>
            <Link to="/resources" className="block px-3 py-2 text-gray-600 dark:text-gray-300">Resources</Link>
            <Link to="/login" className="block px-3 py-2 text-blue-600 font-medium">Sign In</Link>
          </div>
        </div>
      )}
    </nav>
  );
};
