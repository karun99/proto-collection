import React from 'react';
import { Target, Zap, Shield, Rocket } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          About AI Organic Growth CMS
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          The world's first AI-powered SEO Content Management System designed for autonomous growth.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
          <div className="bg-blue-100 p-3 rounded-xl h-fit">
            <Target className="text-blue-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed">
              To empower content creators and businesses with intelligent automation that drives 
              organic traffic without the manual grind of traditional SEO workflows.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
          <div className="bg-amber-100 p-3 rounded-xl h-fit">
            <Zap className="text-amber-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI-First Approach</h3>
            <p className="text-slate-600 leading-relaxed">
              Unlike traditional CMS platforms, we treat AI as a core module, not a plugin. 
              From multi-language generation to affiliate injection, everything is built around automation.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
          <div className="bg-green-100 p-3 rounded-xl h-fit">
            <Shield className="text-green-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Trust & Safety</h3>
            <p className="text-slate-600 leading-relaxed">
              Built with local-first data storage using IndexedDB, ensuring your workspace data 
              remains yours. Privacy and security are baked into our architecture.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
          <div className="bg-purple-100 p-3 rounded-xl h-fit">
            <Rocket className="text-purple-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Autonomous Future</h3>
            <p className="text-slate-600 leading-relaxed">
              We are building towards fully autonomous publishing agents that can manage your entire 
              content lifecycle from keyword research to social media promotion.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-3xl mt-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to scale your organic traffic?</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105">
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
