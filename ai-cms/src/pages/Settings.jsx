import React from 'react';
import { useAppStore } from '../store/appStore';
import { 
  Settings, 
  Cpu, 
  Database, 
  Globe, 
  Bell, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsPage = () => {
  const { aiSettings, setAiSettings } = useAppStore();

  const handleUpdate = (field, value) => {
    setAiSettings({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500">Configure AI models, API keys, and workspace preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Cpu className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-slate-900">AI Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">AI Provider</label>
                <select 
                  value={aiSettings.provider}
                  onChange={(e) => handleUpdate('provider', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                >
                  <option>OpenRouter</option>
                  <option>OpenAI</option>
                  <option>Anthropic</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">AI Model</label>
                <select 
                   value={aiSettings.model}
                   onChange={(e) => handleUpdate('model', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                >
                  <option value="openai/gpt-4o">GPT-4o (Best for SEO)</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Error Verbosity</label>
              <div className="flex gap-4">
                {['basic', 'full'].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleUpdate('verbosity', v)}
                    className={`flex-1 py-2 px-4 rounded-xl border font-bold transition-all ${
                      aiSettings.verbosity === v 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500'
                    }`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Lock className="text-amber-600" size={24} />
              <h3 className="text-lg font-bold text-slate-900">API Keys</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">OpenRouter API Key</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none text-slate-400"
                    disabled
                  />
                  <button className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200">
                    <Eye size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Blogger Client ID</label>
                <input 
                  type="text" 
                  placeholder="Paste your Google Cloud client ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Database className="text-green-600" size={20} />
              <h3 className="font-bold text-slate-900">Data Management</h3>
            </div>
            <p className="text-xs text-slate-500">Your data is stored locally in IndexedDB.</p>
            <div className="space-y-2">
              <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
                Export JSON Backup
              </button>
              <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
                Clear Local Storage
              </button>
            </div>
          </section>

          <section className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white space-y-4">
            <div className="flex items-center gap-3">
              <Globe size={20} />
              <h3 className="font-bold">Multi-Language</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Target global audiences by enabling multi-language content generation in your workflow.
            </p>
            <div className="flex flex-wrap gap-2">
              {['EN', 'ES', 'HI', 'FR', 'DE'].map(l => (
                <span key={l} className="bg-indigo-500 px-2 py-1 rounded-md text-[10px] font-bold">{l}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
