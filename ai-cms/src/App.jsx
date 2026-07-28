import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Docs from './pages/Docs';
import Content from './pages/Content';
import Automation from './pages/Automation';
import Affiliates from './pages/Affiliates';
import Branding from './pages/Branding';
import Settings from './pages/Settings';

const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/content" element={<Content />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/branding" element={<Branding />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
