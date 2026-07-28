import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileEdit, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', traffic: 400, seo: 240 },
  { name: 'Tue', traffic: 300, seo: 139 },
  { name: 'Wed', traffic: 200, seo: 980 },
  { name: 'Thu', traffic: 278, seo: 390 },
  { name: 'Fri', traffic: 189, seo: 480 },
  { name: 'Sat', traffic: 239, seo: 380 },
  { name: 'Sun', traffic: 349, seo: 430 },
];

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trendValue}%
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Generate New Post
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Total Traffic" 
          value="12,482" 
          trend="up" 
          trendValue="12.5" 
          color="blue" 
        />
        <StatCard 
          icon={Users} 
          label="Active Users" 
          value="3,204" 
          trend="up" 
          trendValue="8.2" 
          color="purple" 
        />
        <StatCard 
          icon={FileEdit} 
          label="Drafts" 
          value="14" 
          trend="down" 
          trendValue="3.1" 
          color="amber" 
        />
        <StatCard 
          icon={CheckCircle} 
          label="Published" 
          value="128" 
          trend="up" 
          trendValue="24.4" 
          color="green" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Traffic Growth</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="traffic" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTraffic)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { label: 'AI Post Generated', time: '2 mins ago', desc: 'How to scale SaaS with AI', color: 'blue' },
              { label: 'Published to Blogger', time: '1 hour ago', desc: 'Digital Marketing Trends 2026', color: 'green' },
              { label: 'New Affiliate Added', time: '3 hours ago', desc: 'SEO Masterclass Course', color: 'purple' },
              { label: 'SEO Score Optimized', time: '5 hours ago', desc: 'Local SEO Guide', color: 'amber' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full bg-${item.color}-500 flex-none`} />
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
