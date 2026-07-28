import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code,
  Link as LinkIcon,
  Sparkles,
  Save,
  Globe
} from 'lucide-react';
import { generateContent } from '../../services/ai/aiService';
import { useAppStore } from '../../store/appStore';

const MenuBar = ({ editor, onAiGenerate }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : ''}`}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : ''}`}
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : ''}`}
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : ''}`}
      >
        <ListOrdered size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200 text-blue-600' : ''}`}
      >
        <Quote size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('codeBlock') ? 'bg-slate-200 text-blue-600' : ''}`}
      >
        <Code size={18} />
      </button>
      <div className="flex-1" />
      <button
        onClick={onAiGenerate}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        <Sparkles size={18} />
        <span>AI Generate</span>
      </button>
    </div>
  );
};

const ContentPage = () => {
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { language } = useAppStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: '<p>Start writing your SEO optimized content...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  const handleAiGenerate = async () => {
    if (!title) {
      alert('Please enter a topic title first.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateContent(title);
      setTitle(result.title);
      editor.commands.setContent(`<h2>${result.title}</h2><p>${result.content}</p>`);
    } catch (error) {
      console.error(error);
      alert('Failed to generate content. See console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content Editor</h1>
          <p className="text-slate-500">Create and optimize multi-language blog posts.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
            <Globe size={16} />
            <span>{language.toUpperCase()}</span>
          </div>
          <button className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 font-medium hover:bg-slate-50 transition-colors">
            <Save size={18} />
            <span>Save Draft</span>
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <input
            type="text"
            placeholder="Enter blog topic or title..."
            className="w-full text-2xl font-bold border-none outline-none placeholder:text-slate-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <MenuBar editor={editor} onAiGenerate={handleAiGenerate} />
        
        <div className="relative">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="font-medium text-slate-900">AI is crafting your content in {language.toUpperCase()}...</p>
              </div>
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">SEO Score & Suggestions</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-8 border-green-500 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900">92</span>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-slate-700">Excellent! Your content is well optimized.</p>
              <div className="flex flex-wrap gap-2">
                {['Meta Title OK', 'Keywords OK', 'Images Missing', 'Internal Links OK'].map((tag, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded-full ${tag.includes('Missing') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Affiliate Products</h3>
          <p className="text-sm text-slate-500 mb-4">No products linked yet.</p>
          <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            Auto-Match Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
