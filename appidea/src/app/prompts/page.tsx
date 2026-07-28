'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Prompt, DEFAULT_CATEGORIES, Category } from '@/lib/types';
import { saveToStorage, getFromStorage } from '@/lib/storage';
import { importData } from '@/lib/importUtils';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORIES[2]); // General
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    const savedPrompts = getFromStorage('prompts');
    if (savedPrompts) setPrompts(savedPrompts);

    const savedCategories = getFromStorage('custom_categories');
    if (savedCategories) {
      setCategories([...DEFAULT_CATEGORIES, ...savedCategories]);
    }
  }, []);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    let updated;
    if (editingId) {
      updated = prompts.map(p => 
        p.id === editingId ? { ...p, title, content, category } : p
      );
      setEditingId(null);
    } else {
      const newPrompt: Prompt = {
        id: generateId(),
        title,
        category,
        content,
        createdAt: Date.now(),
      };
      updated = [newPrompt, ...prompts];
    }
    
    setPrompts(updated);
    saveToStorage('prompts', updated);
    
    // Reset form
    setTitle('');
    setContent('');
    setCategory('General');
    setIsAdding(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      alert('Category already exists');
      return;
    }

    const updatedCategories = [...categories, newCategoryName.trim()];
    const customCategories = updatedCategories.filter(c => !DEFAULT_CATEGORIES.includes(c));
    
    setCategories(updatedCategories);
    saveToStorage('custom_categories', customCategories);
    setCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedPrompts = await importData(file);
      const updatedPrompts = [...importedPrompts, ...prompts];
      
      // Filter out duplicates based on content or ID if necessary
      const uniquePrompts = Array.from(new Map(updatedPrompts.map(p => [p.id || p.content, p])).values());
      
      setPrompts(uniquePrompts as Prompt[]);
      saveToStorage('prompts', uniquePrompts);
      alert(`Successfully imported ${importedPrompts.length} prompts!`);
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (prompt: Prompt) => {
    setTitle(prompt.title);
    setContent(prompt.content);
    setCategory(prompt.category);
    setEditingId(prompt.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this prompt?')) {
      const updated = prompts.filter(p => p.id !== id);
      setPrompts(updated);
      saveToStorage('prompts', updated);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Prompt copied to clipboard!');
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.content?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchTerm, filterCategory]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Prompt Manager</h1>
          <p className="text-sm md:text-base text-slate-500">Securely store and organize your AI prompts</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv,.json" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="flex-1 md:flex-none bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Import
          </button>
          <button 
            onClick={() => {
              if (isAdding) {
                setEditingId(null);
                setTitle('');
                setContent('');
                setCategory('General');
              }
              setIsAdding(!isAdding);
            }}
            className={`flex-[1.5] md:flex-none ${isAdding ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white'} px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm`}
          >
            {isAdding ? 'Cancel' : 'Add New'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSavePrompt} className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Prompt' : 'Create New Prompt'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Python Script Assistant"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <button 
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {isAddingCategory ? 'Cancel' : '+ New Category'}
                </button>
              </div>
              
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name..."
                    className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-3 rounded-lg text-sm font-bold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Prompt Content</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={6}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              required
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg">
            {editingId ? 'Update Prompt' : 'Save Prompt'}
          </button>
        </form>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search prompts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => (
          <div key={prompt.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-200 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {prompt.category}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(prompt)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(prompt.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">{prompt.title}</h3>
              <p className="text-slate-600 line-clamp-4 mb-4 text-sm leading-relaxed">{prompt.content}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(prompt.content)}
              className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-2.5 rounded-lg border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Prompt
            </button>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500">
            {searchTerm || filterCategory !== 'All' 
              ? 'No prompts match your search criteria.' 
              : 'No prompts saved yet. Click "Add New Prompt" to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
