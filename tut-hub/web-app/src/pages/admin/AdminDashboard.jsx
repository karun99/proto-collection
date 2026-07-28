import React, { useState } from 'react';
import { Palette, Globe, Shield, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AdminDashboard = () => {
  const { settings, updateSettings } = useTheme();
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateSettings({ platformName, primaryColor });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage platform branding and global configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Platform Branding */}
          <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold dark:text-white">Platform Branding</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Name</label>
                <input 
                  type="text" 
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold dark:text-white">AI Configuration (Admin)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                <p className="text-purple-800 dark:text-purple-300 text-sm">
                  These settings affect how AI features work across the platform for all tutors.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="font-bold dark:text-white">Enable OpenRouter Integration</h4>
                  <p className="text-sm text-gray-500">Allow tutors to use their own API keys.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="font-bold dark:text-white">Default Model</h4>
                  <p className="text-sm text-gray-500">Model used when no specific model is selected.</p>
                </div>
                <select className="bg-gray-50 dark:bg-gray-800 dark:text-white px-3 py-2 rounded-lg border-none outline-none">
                  <option>openai/gpt-3.5-turbo</option>
                  <option>anthropic/claude-2</option>
                  <option>google/palm-2</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-blue-600 p-8 rounded-2xl text-white shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">Admin Security</h3>
            <p className="text-blue-100 text-sm mb-6">Your session is protected with multi-factor authentication. Always log out when finished.</p>
            <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
              Security Logs
            </button>
          </section>

          <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total Tutors</span>
                <span className="font-bold dark:text-white">1,284</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Active Quizzes</span>
                <span className="font-bold dark:text-white">8,432</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">AI Tokens (MTD)</span>
                <span className="font-bold dark:text-white">14.2M</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
