import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 md:pt-20 px-4 text-center space-y-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-blue-50/50 to-transparent -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Privacy-First Secure Workspace
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          From Concept to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Professional Docs</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          The all-in-one workspace for builders. Securely manage prompts, brainstorm ideas, and generate enterprise-grade documentation instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <Link href="/ideation" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200">
            Start Ideating Free
          </Link>
          <Link href="/prompts" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Manage Prompts
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Prompt Builder",
            desc: "Organize your product workflows with categorized, AES-encrypted prompt management.",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ),
            color: "blue",
            link: "/prompts"
          },
          {
            title: "Ideation Workspace",
            desc: "Turn a single sentence into a full suite of product documents and pitch decks manually.",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            color: "indigo",
            link: "/ideation"
          },
          {
            title: "Local-First Security",
            desc: "Your data never leaves your browser. All encryption happens locally on your device.",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ),
            color: "emerald",
            link: "/admin"
          }
        ].map((feat, i) => (
          <div key={i} className="group p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 ${
              feat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
              feat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
              'bg-emerald-50 text-emerald-600'
            }`}>
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm">
              {feat.desc}
            </p>
            <Link href={feat.link} className="inline-flex items-center font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Explore More
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="px-4">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -ml-32 -mb-32" />
          
          <h2 className="text-3xl md:text-5xl font-black text-white max-w-2xl mx-auto leading-tight">
            Ready to ship your <br /> next big idea?
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Join builders who use AppIdea to streamline their workflow and focus on what matters: building great products.
          </p>
          <div className="pt-4">
            <Link href="/ideation" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
