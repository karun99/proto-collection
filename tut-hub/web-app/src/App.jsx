import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/public/LandingPage';
import { TutorCatalog } from './pages/public/TutorCatalog';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuizGenerator } from './pages/tutor/QuizGenerator';
import './styles/globals.css';

// Placeholder Components for remaining routes
const Login = () => <div className="p-24"><h1>Login</h1><p>Authentication coming soon.</p></div>;
const Resources = () => <div className="p-24"><h1>Resources</h1><p>No-code tools and guides.</p></div>;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/tutors" element={<TutorCatalog />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/quiz-builder" element={<QuizGenerator />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
