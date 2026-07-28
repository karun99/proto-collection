'use client';

import { useState, useEffect, useRef } from 'react';
import { saveToStorage, getFromStorage } from '@/lib/storage';
import { exportToPPT, exportToPDF } from '@/lib/exportUtils';

interface Question {
  id: number;
  section: string;
  label: string;
  placeholder: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  { id: 1, section: '🎯 Project Basics', label: 'What problem are you solving?', placeholder: 'Describe the pain point...', hint: '💡 Describe the pain point in 1-2 sentences' },
  { id: 2, section: '🎯 Project Basics', label: 'Who is your target user?', placeholder: 'e.g., Online Tutors, Small Business Owners...', hint: '💡 Job title or role' },
  { id: 3, section: '🎯 Project Basics', label: 'What is your solution?', placeholder: 'The core value proposition...', hint: '💡 The core value proposition' },
  { id: 4, section: '🎯 Project Basics', label: 'What is the unique selling point?', placeholder: 'What makes it different?', hint: '💡 Competitive advantage' },
  
  { id: 5, section: '📋 Core Features', label: 'List 3 core features', placeholder: 'Feature 1, Feature 2, Feature 3...', hint: '💡 Key functionalities' },
  { id: 6, section: '📋 Core Features', label: 'How does the user journey look?', placeholder: 'Steps the user takes...', hint: '💡 User flow overview' },
  { id: 7, section: '📋 Core Features', label: 'Are there any integrations?', placeholder: 'e.g., Stripe, Slack, Gmail...', hint: '💡 External services' },
  
  { id: 8, section: '🛠️ Technical Direction', label: 'What is your preferred tech stack?', placeholder: 'e.g., Next.js, FastAPI, PostgreSQL...', hint: '💡 Frontend, Backend, DB' },
  { id: 9, section: '🛠️ Technical Direction', label: 'What are the main technical challenges?', placeholder: 'e.g., Real-time sync, Scalability...', hint: '💡 Potential bottlenecks' },
  { id: 10, section: '🛠️ Technical Direction', label: 'How will you handle data security?', placeholder: 'e.g., Encryption, OAuth...', hint: '💡 Security measures' },
  
  { id: 11, section: '👥 Team & Launch', label: 'Who are the team members?', placeholder: 'Names and roles...', hint: '💡 Team composition' },
  { id: 12, section: '👥 Team & Launch', label: 'What is your launch strategy?', placeholder: 'How will you get users?', hint: '💡 Marketing & Growth' },
  { id: 13, section: '👥 Team & Launch', label: 'What is the estimated timeline?', placeholder: 'e.g., 3 months to MVP...', hint: '💡 Development roadmap' },
  { id: 14, section: '👥 Team & Launch', label: 'What are the key success metrics?', placeholder: 'e.g., Monthly active users...', hint: '💡 KPIs' },
];

const SECTIONS = ['🎯 Project Basics', '📋 Core Features', '🛠️ Technical Direction', '👥 Team & Launch'];

export default function IdeationPage() {
  // Form State
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed for QUESTIONS array
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Output State
  const [activeTab, setActiveTab] = useState<'Charter' | 'PRD' | 'TDD' | 'Roadmap' | 'Pitch Deck'>('Charter');
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedAnswers = getFromStorage('ideation_answers');
    if (savedAnswers) setAnswers(savedAnswers);
    
    const savedDocs = getFromStorage('ideation_docs');
    if (savedDocs) setGeneratedDocs(savedDocs);
  }, []);

  const progress = Math.round((Object.values(answers).filter(v => v.trim() !== '').length / QUESTIONS.length) * 100);
  const currentQuestion = QUESTIONS[currentStep];
  const currentSection = currentQuestion.section;

  const handleAnswerChange = (val: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: val };
    setAnswers(newAnswers);
    saveToStorage('ideation_answers', newAnswers);
  };

  const handleDocChange = (tab: string, val: string) => {
    const newDocs = { ...generatedDocs, [tab]: val };
    setGeneratedDocs(newDocs);
    saveToStorage('ideation_docs', newDocs);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      handleAnswerChange(text.substring(0, 2000));
      alert('File content loaded into current field.');
    } catch (err: any) {
      alert('Failed to read file: ' + err.message);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateDocs = async () => {
    setIsGeneratingDoc(true);
    
    // Simulate short processing delay for feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    const docs: Record<string, string> = {
      'Charter': `# Project Charter: ${answers[3] || 'New Project'}\n\n## 1. Problem Statement\n${answers[1] || 'TBD'}\n\n## 2. Solution Overview\n${answers[3] || 'TBD'}\n\n## 3. Target Audience\n${answers[2] || 'TBD'}\n\n## 4. Unique Selling Point\n${answers[4] || 'TBD'}`,
      
      'PRD': `# Product Requirements Document\n\n## 1. Core Features\n${(answers[5] || '').split(',').map(f => `- ${f.trim()}`).join('\n')}\n\n## 2. User Journey\n${answers[6] || 'TBD'}\n\n## 3. Integrations\n${answers[7] || 'None specified'}\n\n## 4. Success Metrics\n${answers[14] || 'TBD'}`,
      
      'TDD': `# Technical Design Document\n\n## 1. Technology Stack\n${answers[8] || 'TBD'}\n\n## 2. Technical Challenges\n${answers[9] || 'TBD'}\n\n## 3. Security Measures\n${answers[10] || 'TBD'}`,
      
      'Roadmap': `# Development Roadmap\n\n## 1. Timeline\n${answers[13] || 'TBD'}\n\n## 2. Launch Strategy\n${answers[12] || 'TBD'}`,
      
      'Pitch Deck': `# Pitch Deck Outline\n\n## Slide 1: The Problem\n${answers[1] || 'TBD'}\n\n## Slide 2: The Solution\n${answers[3] || 'TBD'}\n\n## Slide 3: Target Market\n${answers[2] || 'TBD'}\n\n## Slide 4: Competitive Advantage\n${answers[4] || 'TBD'}\n\n## Slide 5: The Team\n${answers[11] || 'TBD'}\n\n## Slide 6: Roadmap\n${answers[13] || 'TBD'}`
    };

    setGeneratedDocs(docs);
    saveToStorage('ideation_docs', docs);
    setIsGeneratingDoc(false);
  };

  const saveToHistory = () => {
    const submission: any = {
      id: Math.random().toString(36).substring(2, 15),
      appName: answers[3] || answers[1]?.substring(0, 20) || 'Unnamed Project',
      problem: answers[1] || '',
      solution: answers[3] || '',
      targetAudience: answers[2] || '',
      keyFeatures: (answers[5] || '').split(',').map(f => f.trim()),
      themeColor: '#2563eb',
      createdAt: Date.now(),
      docs: generatedDocs
    };

    const existing = getFromStorage('submissions') || [];
    saveToStorage('submissions', [submission, ...existing]);
    alert('Progress saved to history!');
  };

  const resetForm = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setAnswers({});
      setGeneratedDocs({});
      saveToStorage('ideation_answers', {});
      saveToStorage('ideation_docs', {});
      setCurrentStep(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 p-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-2">
          🚀 Ideation Workspace
        </h1>
        <p className="text-slate-500 font-medium text-lg">Manually craft your idea, generate professional documentation instantly.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Questions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Progress & Navigation */}
          <div className="bg-white p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto no-scrollbar">
                {SECTIONS.map((section) => (
                  <button 
                    key={section}
                    onClick={() => {
                      const firstInIndex = QUESTIONS.findIndex(q => q.section === section);
                      if (firstInIndex !== -1) setCurrentStep(firstInIndex);
                    }}
                    className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      currentSection === section ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {section.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>
              <div className="text-right ml-auto bg-slate-50 px-4 py-1 rounded-full">
                <span className="text-xl font-black text-slate-900">{Object.keys(answers).length}</span>
                <span className="text-slate-400 text-sm font-bold">/14</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-8">
              <div 
                className="bg-blue-600 h-full transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question UI */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Section {SECTIONS.indexOf(currentSection) + 1} of 4</h3>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{currentQuestion.label}</h2>
                  <p className="text-slate-400 font-medium italic">{currentQuestion.hint}</p>
                </div>
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Import Text"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                  </button>
                  <button 
                    onClick={resetForm}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Reset All"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative group">
                <textarea 
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={4}
                  className="w-full p-6 border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium resize-none shadow-sm"
                />
                <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(answers[currentQuestion.id] || '');
                      alert('Copied!');
                    }}
                    className="p-2.5 bg-white shadow-md border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 active:scale-95 transition-all"
                    title="Copy Answer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleAnswerChange('')}
                    className="p-2.5 bg-white shadow-md border border-slate-100 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 active:scale-95 transition-all"
                    title="Clear Field"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black hover:bg-slate-100 disabled:opacity-30 transition-all border border-slate-200"
                >
                  ← PREVIOUS
                </button>
                <button 
                  onClick={() => setCurrentStep(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
                  disabled={currentStep === QUESTIONS.length - 1}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all"
                >
                  NEXT →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Output */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 h-full flex flex-col group/preview">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  📄 {activeTab}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Manual Draft</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDocs[activeTab] || '');
                    alert('Copied to clipboard!');
                  }}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Copy to Clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                <button 
                  onClick={generateDocs}
                  disabled={isGeneratingDoc}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Refresh"
                >
                  <svg className={`h-5 w-5 ${isGeneratingDoc ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-4 no-scrollbar border-b border-slate-100 mb-6">
              {(['Charter', 'PRD', 'TDD', 'Roadmap', 'Pitch Deck'] as const).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-grow relative bg-slate-50 rounded-[1.5rem] border border-slate-100 overflow-hidden group/editor">
              {isGeneratingDoc ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-20 bg-slate-50">
                  <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Updating Preview...</p>
                </div>
              ) : (
                <textarea
                  value={generatedDocs[activeTab] || ''}
                  onChange={(e) => handleDocChange(activeTab, e.target.value)}
                  placeholder={`Your ${activeTab} content will appear here after generation. You can also edit this text manually...`}
                  className={`w-full h-full p-8 bg-transparent font-mono text-sm leading-relaxed text-slate-700 outline-none resize-none no-scrollbar selection:bg-blue-100 selection:text-blue-900 ${
                    !generatedDocs[activeTab] ? 'flex items-center justify-center text-center' : ''
                  }`}
                  style={{ minHeight: '450px' }}
                />
              )}
              
              {!isGeneratingDoc && !generatedDocs[activeTab] && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 group-hover/editor:opacity-60 transition-opacity p-8">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-widest">Manual Drafting</p>
                  <p className="text-[10px] text-slate-500 max-w-[200px] text-center mt-2 font-medium leading-relaxed">Start typing your {activeTab} manually or complete the questions and click generate.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => exportToPDF({ appName: answers[3] || 'Project', content: generatedDocs[activeTab] })}
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-[1.02] shadow-sm"
              >
                📄 EXPORT PDF
              </button>
              <button 
                onClick={() => exportToPPT({ appName: answers[3] || 'Project', content: generatedDocs[activeTab] })}
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-[1.02] shadow-sm"
              >
                🎨 EXPORT PPTX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-0 md:px-6 z-50">
        <div className="bg-white/95 backdrop-blur-xl border-t md:border border-slate-200 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] md:rounded-[2rem] p-4 flex items-center justify-between gap-4">
          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">{progress}%</span>
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          
          <div className="flex-grow flex gap-3">
            <button 
              onClick={generateDocs}
              disabled={isGeneratingDoc || progress < 10}
              className="flex-grow px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all disabled:opacity-30 disabled:grayscale"
            >
              {isGeneratingDoc ? 'GENERATING...' : '🚀 GENERATE DOCUMENTATION'}
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={saveToHistory}
              className="p-4 bg-slate-50 text-slate-600 rounded-[1.25rem] hover:bg-slate-100 transition-all border border-slate-100 active:scale-95" 
              title="Save Progress"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V4a1 1 0 10-2 0v7.586l-1.293-1.293z" />
                <path d="M5 17a2 2 0 01-2-2V7a2 2 0 012-2 1 1 0 011 1h8a1 1 0 011-1 2 2 0 012 2v8a2 2 0 01-2 2H5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
