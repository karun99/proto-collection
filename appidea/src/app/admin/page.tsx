'use client';

import { useState, useEffect } from 'react';
import { Prompt, IdeationSubmission } from '@/lib/types';
import { getFromStorage, saveToStorage } from '@/lib/storage';
import { exportToPPT, exportToPDF } from '@/lib/exportUtils';
import { generateCSV } from '@/lib/csvUtils';
import { importData } from '@/lib/importUtils';

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [submissions, setSubmissions] = useState<IdeationSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'prompts'>('submissions');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [viewingDocs, setViewingDocs] = useState<Record<string, string> | null>(null);

  // Editing state
  const [editingSubmission, setEditingSubmission] = useState<IdeationSubmission | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    const savedPrompts = getFromStorage('prompts') || [];
    const savedSubmissions = getFromStorage('submissions') || [];
    setPrompts(savedPrompts);
    setSubmissions(savedSubmissions);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      localStorage.clear();
      setPrompts([]);
      setSubmissions([]);
      alert('All data has been cleared.');
    }
  };

  const saveSubmissionEdit = () => {
    if (!editingSubmission) return;
    const updated = submissions.map(s => s.id === editingSubmission.id ? editingSubmission : s);
    setSubmissions(updated);
    saveToStorage('submissions', updated);
    setEditingSubmission(null);
  };

  const deleteSubmission = (id: string) => {
    if (confirm('Delete this submission?')) {
      const updated = submissions.filter(s => s.id !== id);
      setSubmissions(updated);
      saveToStorage('submissions', updated);
    }
  };

  const savePromptEdit = () => {
    if (!editingPrompt) return;
    const updated = prompts.map(p => p.id === editingPrompt.id ? editingPrompt : p);
    setPrompts(updated);
    saveToStorage('prompts', updated);
    setEditingPrompt(null);
  };

  const deletePrompt = (id: string) => {
    if (confirm('Delete this prompt?')) {
      const updated = prompts.filter(p => p.id !== id);
      setPrompts(updated);
      saveToStorage('prompts', updated);
    }
  };

  const exportDataJSON = () => {
    const data = {
      prompts,
      submissions,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appidea_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDataCSV = () => {
    if (activeTab === 'submissions') {
      generateCSV(submissions, `submissions_export_${new Date().toISOString().split('T')[0]}`);
    } else {
      generateCSV(prompts, `prompts_export_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (activeTab === 'submissions') {
        const imported = await importData<IdeationSubmission>(file);
        const updated = [...imported, ...submissions];
        const unique = Array.from(new Map(updated.map(s => [s.id, s])).values());
        setSubmissions(unique);
        saveToStorage('submissions', unique);
        alert(`Successfully imported ${imported.length} submissions!`);
      } else {
        const imported = await importData<Prompt>(file);
        const updated = [...imported, ...prompts];
        const unique = Array.from(new Map(updated.map(p => [p.id, p])).values());
        setPrompts(unique);
        saveToStorage('prompts', unique);
        alert(`Successfully imported ${imported.length} prompts!`);
      }
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    }
    
    e.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500">Enter your password to manage local data</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your local encrypted storage</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={exportDataJSON} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">JSON (Backup)</button>
              <button onClick={exportDataCSV} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">CSV (Current Tab)</button>
            </div>
          </div>

          <label className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON/CSV
            <input type="file" accept=".json,.csv" onChange={handleImport} className="hidden" />
          </label>
          <button 
            onClick={handleClearAll}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-100 hover:bg-red-100 transition-colors text-sm font-semibold"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Submissions</p>
          <p className="text-4xl font-bold mt-2 text-purple-600">{submissions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Prompts</p>
          <p className="text-4xl font-bold mt-2 text-blue-600">{prompts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Security Status</p>
          <div className="flex items-center gap-2 mt-2 text-green-600 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            AES-256 Active
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-8 py-4 font-semibold transition-colors ${activeTab === 'submissions' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Ideation History
          </button>
          <button 
            onClick={() => setActiveTab('prompts')}
            className={`px-8 py-4 font-semibold transition-colors ${activeTab === 'prompts' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Saved Prompts
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'submissions' ? (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p className="italic">No submissions found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-slate-500 text-sm">
                        <th className="pb-4 font-semibold">App Name</th>
                        <th className="pb-4 font-semibold">Target Audience</th>
                        <th className="pb-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4">
                            {editingSubmission?.id === sub.id ? (
                              <input 
                                type="text" 
                                value={editingSubmission.appName}
                                onChange={e => setEditingSubmission({...editingSubmission, appName: e.target.value})}
                                className="border rounded px-2 py-1 w-full"
                              />
                            ) : (
                              <span className="font-bold text-slate-800">{sub.appName}</span>
                            )}
                          </td>
                          <td className="py-4 text-sm text-slate-600">
                            {editingSubmission?.id === sub.id ? (
                              <input 
                                type="text" 
                                value={editingSubmission.targetAudience}
                                onChange={e => setEditingSubmission({...editingSubmission, targetAudience: e.target.value})}
                                className="border rounded px-2 py-1 w-full"
                              />
                            ) : (
                              sub.targetAudience
                            )}
                          </td>
                          <td className="py-4 text-right space-x-2">
                            {editingSubmission?.id === sub.id ? (
                              <>
                                <button onClick={saveSubmissionEdit} className="text-xs font-bold text-green-600 hover:underline">Save</button>
                                <button onClick={() => setEditingSubmission(null)} className="text-xs font-bold text-slate-500 hover:underline">Cancel</button>
                              </>
                            ) : (
                              <>
                                {sub.docs && (
                                  <button onClick={() => setViewingDocs(sub.docs!)} className="text-xs font-bold text-blue-600 hover:underline px-2">View Docs</button>
                                )}
                                <button onClick={() => exportToPPT({ appName: sub.appName, content: JSON.stringify(sub.docs || {}), themeColor: sub.themeColor })} className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-all">PPT</button>
                                <button onClick={() => exportToPDF({ appName: sub.appName, content: JSON.stringify(sub.docs || {}), themeColor: sub.themeColor })} className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded hover:bg-purple-600 hover:text-white transition-all">PDF</button>
                                <button onClick={() => setEditingSubmission(sub)} className="text-xs text-slate-500 hover:text-blue-600 px-2">Edit</button>
                                <button onClick={() => deleteSubmission(sub.id)} className="text-xs text-slate-400 hover:text-red-600 px-2">Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p className="italic">No prompts found.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-xl hover:bg-slate-50 transition-colors gap-4">
                      {editingPrompt?.id === prompt.id ? (
                        <div className="flex-grow w-full space-y-2">
                           <input 
                              type="text" 
                              value={editingPrompt.title}
                              onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})}
                              className="border rounded px-2 py-1 w-full font-bold"
                           />
                           <textarea 
                              value={editingPrompt.content}
                              onChange={e => setEditingPrompt({...editingPrompt, content: e.target.value})}
                              className="border rounded px-2 py-1 w-full text-sm"
                              rows={2}
                           />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {prompt.category}
                          </span>
                          <span className="font-semibold text-slate-800">{prompt.title}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {editingPrompt?.id === prompt.id ? (
                           <>
                              <button onClick={savePromptEdit} className="font-bold text-green-600 hover:underline">Save</button>
                              <button onClick={() => setEditingPrompt(null)} className="font-bold text-slate-500 hover:underline">Cancel</button>
                           </>
                        ) : (
                          <>
                            <button onClick={() => setEditingPrompt(prompt)} className="hover:text-blue-600 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => deletePrompt(prompt.id)} className="hover:text-red-600 transition-colors">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Docs Modal */}
      {viewingDocs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Generated Documentation</h2>
              <button onClick={() => setViewingDocs(null)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {Object.entries(viewingDocs).map(([title, content]) => (
                <div key={title} className="space-y-2">
                  <h3 className="text-lg font-black text-blue-600 uppercase tracking-widest">{title}</h3>
                  <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm whitespace-pre-wrap border border-slate-100">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
