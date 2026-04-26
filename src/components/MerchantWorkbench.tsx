import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Recommendation {
  id: string;
  sku: string;
  type: string;
  description: string;
  recommendation: string;
  impact: string;
  confidence: number;
}

export default function MerchantWorkbench({ 
  recommendations, 
  onExecute 
}: { 
  recommendations: Recommendation[],
  onExecute: (id: string) => void
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            AI Recommendation Engine
            <Sparkles size={20} className="text-purple-500 fill-purple-500" />
          </h2>
          <p className="text-slate-500 text-sm">Automated demand sensing & markdown optimization</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Resolve All (3)
          </button>
        </div>
      </div>

      <div className="space-y-4">
            <AnimatePresence>
              {recommendations.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                        {rec.type}
                      </span>
                      <span className="text-sm font-mono text-slate-400 font-medium">{rec.sku}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 mb-1">{rec.description}</p>
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <Zap size={14} className="fill-emerald-600" />
                      <span>{rec.recommendation}</span>
                      <span className="text-slate-300 mx-1">|</span>
                      <span className="font-bold">{rec.impact}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-8 border-x border-slate-100 h-12">
                    <div className="text-center">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Confidence</p>
                      <div className="flex items-center justify-center gap-1 font-bold text-slate-800">
                        {Math.round(rec.confidence * 100)}%
                        <ShieldCheck size={14} className="text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => onExecute(rec.id)}
                      className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl transition-all text-sm"
                    >
                      Ignore
                    </button>
                    <button 
                      onClick={() => onExecute(rec.id)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all"
                    >
                      Execute
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
      </div>
    </div>
  );
}
