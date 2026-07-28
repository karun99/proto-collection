import React from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  Plus, 
  Search,
  DollarSign,
  MousePointer2
} from 'lucide-react';

const AffiliatesPage = () => {
  const products = [
    { id: 1, name: 'SEO Masterclass 2026', price: '$199', commission: '25%', clicks: 420, conversions: 12 },
    { id: 2, name: 'AI Writing Pro', price: '$49/mo', commission: '30%', clicks: 850, conversions: 45 },
    { id: 3, name: 'Cloud Hosting Elite', price: '$120/yr', commission: '$50', clicks: 150, conversions: 5 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Affiliate Marketing</h1>
          <p className="text-slate-500">Manage products and track automated conversions.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2 text-slate-500">
            <DollarSign size={20} />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">$4,280.50</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2 text-slate-500">
            <MousePointer2 size={20} />
            <span className="text-sm font-medium">Avg. CTR</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">4.8%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2 text-slate-500">
            <ShoppingBag size={20} />
            <span className="text-sm font-medium">Top Product</span>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Trending</span>
          </div>
          <p className="text-xl font-bold text-slate-900 truncate">AI Writing Pro</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <Search className="text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-transparent border-none outline-none text-sm flex-1"
          />
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Product Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Commission</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Clicks</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Conversions</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.price}</p>
                </td>
                <td className="p-4 text-sm text-slate-600 font-medium">{p.commission}</td>
                <td className="p-4 text-sm text-slate-600 text-center">{p.clicks}</td>
                <td className="p-4 text-sm text-slate-600 text-center font-bold">{p.conversions}</td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffiliatesPage;
