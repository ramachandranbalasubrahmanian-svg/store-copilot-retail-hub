import React from 'react';
import { motion } from 'motion/react';
import { Users, Timer, CheckCircle, AlertTriangle, Play, Settings, HardDrive } from 'lucide-react';
import { cn } from '../lib/utils';

interface StoreOpsData {
  occupancy: number;
  staffCount: number;
  trafficTrend: string;
  dataCapacity: number;
  queues: {
    id: string;
    name: string;
    wait: number;
    status: 'FAST'|'STABLE'|'SLOW';
  }[];
  tasks: {
    id: string;
    label: string;
    priority: 'HIGH'|'MEDIUM'|'LOW';
    status: 'PENDING'|'COMPLETED';
  }[];
}

export default function StoreOperations({ data, onCompleteTask }: { data: StoreOpsData | null, onCompleteTask: (id: string) => void }) {
  if (!data) return <div className="p-8 text-center text-slate-500">Syncing with store sensor array...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Store Ops Center</h2>
          <p className="text-slate-500 mt-1">Live occupancy and throughput optimization</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className="px-4 py-2 bg-slate-50 rounded-xl text-center">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occupancy</div>
             <div className="text-xl font-bold text-slate-900">{data.occupancy} <span className="text-xs font-normal text-slate-400">/ 250</span></div>
           </div>
           <div className="px-4 py-2 bg-indigo-50 rounded-xl text-center">
             <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Staffing</div>
             <div className="text-xl font-bold text-indigo-600">{data.staffCount}</div>
           </div>
           <div className="px-4 py-2 bg-slate-900 rounded-xl text-center min-w-[100px]">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Data Capacity</div>
             <div className="text-xl font-bold text-white flex items-center justify-center gap-2">
               {data.dataCapacity}% 
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Queues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Timer size={18} className="text-indigo-500" />
                Wait Time Analytics
              </h3>
              <span className="text-xs text-slate-400 font-medium">Auto-refresh every 30s</span>
            </div>
            
            <div className="space-y-4">
              {data.queues.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold",
                      q.status === 'FAST' ? "bg-emerald-100 text-emerald-600" : 
                      q.status === 'SLOW' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {q.wait}m
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{q.name}</div>
                      <div className="text-xs text-slate-500 tracking-wide uppercase font-bold">{q.status} THROUGHPUT</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:block">
                      <div className="text-[10px] text-slate-400 font-bold uppercase text-right">Trend</div>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <div key={i} className={cn("w-1 h-3 rounded-full", i < 4 ? "bg-indigo-400" : "bg-slate-200")} />
                        ))}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Users size={24} className="text-indigo-300" />
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold tracking-widest uppercase">Live View</span>
              </div>
              <h4 className="text-sm font-medium text-slate-400 mb-1">Customer Sentiment Pulse</h4>
              <div className="text-3xl font-bold mb-4">Positive <span className="text-emerald-400">82%</span></div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[82%]" />
              </div>
            </div>

            <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <h4 className="text-sm font-medium text-indigo-100 mb-1">Operational Risk</h4>
              <div className="text-3xl font-bold mb-4">Low <span className="text-indigo-200">Grade A</span></div>
              <p className="text-xs text-indigo-100/60 leading-relaxed">System monitoring 42 nodes including HVAC, Lighting, and Cold Storage. No current outages detected.</p>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <div className="space-y-6">
          <div className="glass-card p-6 min-h-[400px] flex flex-col">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <CheckCircle size={18} className="text-emerald-500" />
              Active Task Board
            </h3>

            <div className="space-y-3 flex-1 overflow-auto">
              {data.tasks.map((task) => (
                <motion.div 
                  key={task.id}
                  layout
                  className={cn(
                    "p-4 rounded-2xl border transition-all",
                    task.status === 'COMPLETED' ? "bg-slate-50 border-transparent opacity-60" : "bg-white border-slate-100 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                      task.priority === 'HIGH' ? "bg-rose-100 text-rose-600" : 
                      task.priority === 'MEDIUM' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {task.priority}
                    </span>
                    {task.status === 'COMPLETED' && <CheckCircle size={16} className="text-emerald-500" />}
                  </div>
                  <div className="font-bold text-slate-800 text-sm mb-4 leading-snug">{task.label}</div>
                  
                  {task.status === 'PENDING' && (
                    <button 
                      onClick={() => onCompleteTask(task.id)}
                      className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={12} className="fill-white" /> Mark Complete
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
               <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-4">
                 <div className="flex items-center gap-4">
                   <HardDrive size={14} /> SYSTEM NODES
                 </div>
                 <span className="text-slate-500">{data.dataCapacity}% UTILIZED</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${data.dataCapacity}%` }}
                   className={cn(
                     "h-full transition-all duration-1000",
                     data.dataCapacity > 90 ? "bg-rose-500" : data.dataCapacity > 70 ? "bg-amber-500" : "bg-emerald-500"
                   )} 
                 />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
