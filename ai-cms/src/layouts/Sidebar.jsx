import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  Settings, 
  ShoppingBag, 
  Palette, 
  Info, 
  BookOpen,
  Globe
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Sidebar = () => {
  const location = useLocation();
  const { branding, language, setLanguage, aiSettings } = useAppStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Content', path: '/content' },
    { icon: Cpu, label: 'Automation', path: '/automation' },
    { icon: ShoppingBag, label: 'Affiliates', path: '/affiliates' },
    { icon: Palette, label: 'Branding', path: '/branding' },
    { icon: Info, label: 'About', path: '/about' },
    { icon: BookOpen, label: 'Docs', path: '/docs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">AI</div>
        <span>{branding.brandName}</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
          <Globe size={16} />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none outline-none cursor-pointer"
          >
            {aiSettings.languages.map(lang => (
              <option key={lang} value={lang} className="bg-slate-900">{lang.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500 text-center">
          v1.0.0-beta
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
