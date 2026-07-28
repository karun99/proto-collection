import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Layout, 
  Database, 
  Share2, 
  BarChart3, 
  Workflow 
} from 'lucide-react';

const DocsPage = () => {
  const modules = [
    {
      title: "1. Authentication & Security",
      icon: ShieldCheck,
      color: "text-blue-600",
      content: "JWT-based session management with role-based access control (Super Admin, Admin, Author, Client). Workspace isolation ensures client data privacy."
    },
    {
      title: "2. AI Automation Engine",
      icon: Cpu,
      color: "text-purple-600",
      content: "Powered by OpenRouter. Automates SEO content generation, multi-language writing (English, Spanish, French, German, Hindi), and smart internal linking."
    },
    {
      title: "3. Admin Control Panel",
      icon: Layout,
      color: "text-amber-600",
      content: "Centralized dashboard to enable/disable AI modules, configure models, and manage publishing queues. Real-time token usage tracking included."
    },
    {
      title: "4. Database Architecture",
      icon: Database,
      color: "text-green-600",
      content: "Local-first storage using IndexedDB for high performance and offline capability. Support for JSON and SQL exports for portability."
    },
    {
      title: "5. Blogger Synchronization",
      icon: Share2,
      color: "text-orange-600",
      content: "Direct API integration with Blogger. Features scheduled publishing, draft sync, and automated SEO metadata mapping."
    },
    {
      title: "6. Analytics System",
      icon: BarChart3,
      color: "text-indigo-600",
      content: "Visual tracking of organic traffic growth, affiliate CTR, and SEO score trends using Recharts."
    },
    {
      title: "7. Workflow Builder",
      icon: Workflow,
      color: "text-pink-600",
      content: "Drag-and-drop automation builder. Create triggers like 'Daily Post' or 'Keyword Alert' to initiate complex AI workflows."
    }
  ];

  return (
    <div className="space-y-12">
      <header className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-bold text-slate-900">Technical Documentation</h1>
        <p className="text-slate-500 mt-2">Comprehensive guide to the AI CMS architecture and modules.</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Application Architecture</h2>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-sm overflow-x-auto">
          <pre>{`
┌────────────────────────────┐
│        React Admin         │
└─────────────┬──────────────┘
              │
     ┌────────▼────────┐
     │ Zustand Store   │
     └────────┬────────┘
              │
┌─────────────▼─────────────┐
│ Database Adapter Layer    │
└─────────────┬─────────────┘
              │
┌───────┬─────┴───────┬───────┐
│       │             │       │
▼       ▼             ▼       ▼
Local  IndexedDB    JSON     SQL
Storage             Export   Export
          `}</pre>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <module.icon className={module.color} size={24} />
              <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {module.content}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">How it Works: The Content Pipeline</h2>
        <ol className="space-y-4">
          {[
            "Input a topic or keyword in the Automation module.",
            "AI Engine fetches research and generates structured content in the selected language.",
            "SEO module analyzes and optimizes the content (meta tags, headers, links).",
            "Affiliate module injects relevant product widgets and CTAs.",
            "Review the draft in the Content module or auto-publish to Blogger."
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-none w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-blue-800">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default DocsPage;
