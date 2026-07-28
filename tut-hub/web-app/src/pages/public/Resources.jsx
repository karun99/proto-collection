import React from 'react';
import { BookOpen, Video, FileText, Code, ExternalLink } from 'lucide-react';

const RESOURCES = [
  {
    title: 'How to Market Your Tutoring Business',
    description: 'A comprehensive guide on finding your first 10 students.',
    type: 'Guide',
    icon: <BookOpen className="w-6 h-6 text-blue-500" />,
    link: '#'
  },
  {
    title: 'Zoom Integration for Virtual Classes',
    description: 'Setup automatic meeting generation for your online sessions.',
    type: 'Integration',
    icon: <Video className="w-6 h-6 text-purple-500" />,
    link: '#'
  },
  {
    title: 'Invoice Templates',
    description: 'Professional, ready-to-use invoice templates for freelancers.',
    type: 'Template',
    icon: <FileText className="w-6 h-6 text-green-500" />,
    link: '#'
  },
  {
    title: 'No-Code Website Builders',
    description: 'Build your personal brand page without writing code.',
    type: 'Tool',
    icon: <Code className="w-6 h-6 text-orange-500" />,
    link: '#'
  }
];

export const Resources = () => {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold dark:text-white mb-4">Tutor Resources</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Tools, guides, and templates to help you build, manage, and grow your independent tutoring business.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {RESOURCES.map((resource, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group flex items-start">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mr-6 group-hover:scale-110 transition-transform">
              {resource.icon}
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{resource.type}</span>
              <h3 className="text-xl font-bold dark:text-white mb-2">{resource.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
              <a href={resource.link} className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700">
                View Resource <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-blue-600 rounded-3xl p-10 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Need personalized help?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join our community forum to connect with other educators, ask questions, and share your own expertise.</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg">
            Join the Community
          </button>
        </div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};
