import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface MetricData {
  revenue: {
    daily: number;
    target: number;
    trend: string;
    history1H: any[];
    history24H: any[];
    history7D: any[];
  };
  inventory: {
    stockoutRate: number;
    overstockValue: number;
    health: any[];
  };
  customers: {
    active30d: number;
    churnRisk: number;
    nps: number;
    segments: any[];
  };
}

export default function ExecutiveDashboard({ data }: { data: MetricData | null }) {
  const [timeframe, setTimeframe] = React.useState<'1H' | '24H' | '7D'>('24H');
  if (!data) return <div className="p-8 text-center">Fueling data lake...</div>;

  const currentHistory = timeframe === '1H' ? data.revenue.history1H : timeframe === '24H' ? data.revenue.history24H : data.revenue.history7D;


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Metric 1: Revenue */}
      <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-sm mb-1">Daily Revenue</p>
        <p className="text-2xl font-bold text-slate-800">${data.revenue.daily.toLocaleString()}</p>
        <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-[72%]"></div>
        </div>
      </motion.div>

      {/* Metric 2: Stockout */}
      <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-sm mb-1">Stockout Rate</p>
        <p className="text-2xl font-bold text-slate-800">{data.inventory.stockoutRate}%</p>
        <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-[15%]"></div>
        </div>
      </motion.div>

      {/* Metric 3: Active Users */}
      <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-sm mb-1">Active Customers</p>
        <p className="text-2xl font-bold text-slate-800">{data.customers.active30d.toLocaleString()}</p>
        <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 w-[84%]"></div>
        </div>
      </motion.div>

      {/* Metric 4: NPS */}
      <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-sm mb-1">Satisfaction NPS</p>
        <p className="text-2xl font-bold text-slate-800">{data.customers.nps}</p>
        <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-[92%]"></div>
        </div>
      </motion.div>

      {/* Traffic Overview Chart (Large) */}
      <motion.div variants={item} className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Revenue Overview</h3>
          <div className="flex gap-2">
            {[
              { id: '1H', label: '1H' },
              { id: '24H', label: '24H' },
              { id: '7D', label: '7D' }
            ].map((tf) => (
              <span 
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                  timeframe === tf.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tf.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 w-full bg-slate-50/50 rounded-2xl relative overflow-hidden p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentHistory}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Events / AI Activity */}
      <motion.div variants={item} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[400px]">
        <h3 className="font-bold text-lg mb-4">Agent Intelligence</h3>
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {[
            { tag: 'Pricing', text: 'Markdown for "Summer Denim"', time: '2m ago', color: 'blue' },
            { tag: 'Replenish', text: 'Stock move for Store #45', time: '14m ago', color: 'amber' },
            { tag: 'Health', text: 'Inventory snapshot synced', time: '1h ago', color: 'emerald' },
            { tag: 'Analytics', text: 'WoW growth reports ready', time: '3h ago', color: 'violet' }
          ].map((activity, i) => (
            <div key={i} className="flex gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                activity.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                activity.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                activity.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600'
              )}>
                <Activity size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                <p className="text-xs text-slate-500">{activity.tag} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-colors text-sm mt-4 border border-slate-200">
          View Audit Logs
        </button>
      </motion.div>
    </motion.div>
  );
}
