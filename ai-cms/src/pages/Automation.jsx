import React from 'react';
import { 
  Plus, 
  Play, 
  Clock, 
  Trash2, 
  ToggleLeft as Toggle,
  ArrowRight
} from 'lucide-react';

const AutomationPage = () => {
  const workflows = [
    { id: 1, name: 'Daily SEO Blog', trigger: 'Daily @ 08:00', status: 'Active', color: 'blue' },
    { id: 2, name: 'Keyword Alert: AI', trigger: 'Real-time', status: 'Active', color: 'purple' },
    { id: 3, name: 'Weekly Newsletter', trigger: 'Monday @ 10:00', status: 'Paused', color: 'slate' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Automation Engine</h1>
          <p className="text-slate-500">Design autonomous content workflows.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Create Workflow</span>
        </button>
      </header>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-6 items-center">
        <div className="bg-blue-600 p-3 rounded-xl">
          <Clock className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900">Next Scheduled Run</h3>
          <p className="text-blue-700">Daily SEO Blog will run in <span className="font-bold">2 hours and 15 minutes</span>.</p>
        </div>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
          Run Now
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group">
            <div className={`w-12 h-12 rounded-xl bg-${wf.color}-50 flex items-center justify-center`}>
              <Play className={`text-${wf.color}-600`} size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900">{wf.name}</h4>
              <p className="text-sm text-slate-500">{wf.trigger}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${wf.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                {wf.status}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                  <Toggle size={20} />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">New: Multi-Agent Workflows</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Assign different AI agents for research, writing, and SEO audit within a single automation pipeline.
          </p>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all">
            <span>Explore Beta Features</span>
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
      </section>
    </div>
  );
};

export default AutomationPage;
