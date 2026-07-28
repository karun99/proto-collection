import React from 'react';
import { useAppStore } from '../store/appStore';
import { Palette, Upload, Type, Layout } from 'lucide-react';

const BrandingPage = () => {
  const { branding, updateBranding } = useAppStore();

  const handleUpdate = (field, value) => {
    updateBranding({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">White-Label Branding</h1>
        <p className="text-slate-500">Customize the platform interface to match your brand identity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Brand Name</label>
            <div className="flex gap-4">
              <div className="bg-slate-100 p-3 rounded-xl">
                <Type className="text-slate-600" size={20} />
              </div>
              <input 
                type="text" 
                value={branding.brandName}
                onChange={(e) => handleUpdate('brandName', e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Logo (URL)</label>
            <div className="flex gap-4">
              <div className="bg-slate-100 p-3 rounded-xl">
                <Upload className="text-slate-600" size={20} />
              </div>
              <input 
                type="text" 
                placeholder="https://example.com/logo.png"
                value={branding.logo}
                onChange={(e) => handleUpdate('logo', e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Primary Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={branding.primaryColor}
                  onChange={(e) => handleUpdate('primaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border-none cursor-pointer"
                />
                <span className="text-sm font-mono text-slate-500 uppercase">{branding.primaryColor}</span>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Secondary Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={branding.secondaryColor}
                  onChange={(e) => handleUpdate('secondaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border-none cursor-pointer"
                />
                <span className="text-sm font-mono text-slate-500 uppercase">{branding.secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: branding.primaryColor }}>
            <Palette size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Preview Interface</h2>
          <p className="text-slate-400 max-w-xs">
            See how your brand colors and name affect the client-facing dashboard and reports.
          </p>
          
          <div className="w-full bg-slate-800 rounded-2xl p-4 border border-slate-700 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded bg-slate-600" style={{ backgroundColor: branding.primaryColor }} />
              <span className="text-xs font-bold">{branding.brandName}</span>
            </div>
            <div className="h-2 w-3/4 bg-slate-700 rounded mb-2" />
            <div className="h-2 w-1/2 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;
