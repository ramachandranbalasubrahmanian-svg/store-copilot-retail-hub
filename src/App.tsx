/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Database, Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import MerchantWorkbench from './components/MerchantWorkbench';
import StoreCopilot from './components/StoreCopilot';
import StoreOperations from './components/StoreOperations';
import { cn } from './lib/utils';

type View = 'dashboard' | 'workbench' | 'operations';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [metrics, setMetrics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const seedData = async (force = false) => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const metricPath = 'config/metrics';
      const metricDoc = await getDoc(doc(db, metricPath)).catch(e => {
        handleFirestoreError(e, OperationType.GET, metricPath);
        return null;
      });
      
      const shouldSeed = !metricDoc || !metricDoc.exists() || force || !metricDoc.data()?.revenueHistory1H || !metricDoc.data()?.storeOps?.dataCapacity;

      if (shouldSeed) {
        console.log("Generating synthetic data lake...");
        const batch = writeBatch(db);
        
        // Generate 60 points for 1H (one per minute)
        const history1H = Array.from({ length: 60 }, (_, i) => ({
          name: `${i}m`,
          value: 1200 + Math.random() * 800 + (Math.sin(i / 5) * 200)
        }));

        // Generate 24 points for 24H
        const history24H = Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          value: 8000 + Math.random() * 5000 + (i > 8 && i < 20 ? 4000 : 0)
        }));

        // Generate 7 points for 7D
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const history7D = days.map(d => ({
          name: d,
          value: 120000 + Math.random() * 40000
        }));

        batch.set(doc(db, 'config', 'metrics'), {
          dailyRevenue: 142500,
          revenueTarget: 150000,
          revenueTrend: "+5.2%",
          revenueHistory1H: history1H,
          revenueHistory24H: history24H,
          revenueHistory7D: history7D,
          storeOps: {
            occupancy: 142,
            staffCount: 18,
            trafficTrend: "UP",
            dataCapacity: 68,
            queues: [
              { id: 'Q1', name: 'Standard Checkout', wait: 4, status: 'STABLE' },
              { id: 'Q2', name: 'Self-Service', wait: 2, status: 'FAST' },
              { id: 'Q3', name: 'Returns Desk', wait: 12, status: 'SLOW' }
            ],
            tasks: [
              { id: 'T1', label: 'Safety Perimeter Check', priority: 'HIGH', status: 'PENDING' },
              { id: 'T2', label: 'Restock Footwear Aisle 4', priority: 'MEDIUM', status: 'PENDING' },
              { id: 'T3', label: 'Price Audit: Denim Line', priority: 'LOW', status: 'COMPLETED' },
              { id: 'T4', label: 'HVAC Filter Maintenance', priority: 'MEDIUM', status: 'PENDING' }
            ]
          },
          stockoutRate: 4.2,
          overstockValue: 85000,
          inventoryHealth: [
            { category: "Apparel", stockout: 3, overstock: 12 },
            { category: "Footwear", stockout: 6, overstock: 8 },
            { category: "Accessories", stockout: 2, overstock: 15 },
            { category: "Home", stockout: 5, overstock: 5 }
          ],
          active30d: 42000,
          churnRisk: 1200,
          nps: 72,
          customerSegments: [
            { name: "Loyal", value: 35 }, { name: "New", value: 20 },
            { name: "At Risk", value: 15 }, { name: "Inactive", value: 30 }
          ]
        });

        const initialRecs = [
          { sku: "TSHIRT-BLUE-M", type: "MARKDOWN", description: "Low sell-through for Summer Collection", recommendation: "Markdown 15%", impact: "+$12.5k revenue", confidence: 0.92, status: "PENDING", createdAt: new Date().toISOString() },
          { sku: "SNEAKER-RUN-10", type: "REDISTRIBUTE", description: "Stockout in Store #12", recommendation: "Move 50 units", impact: "-8% stockout rate", confidence: 0.88, status: "PENDING", createdAt: new Date().toISOString() },
          { sku: "DENIM-STR-32", type: "PRICING", description: "Competitor price index at 1.18", recommendation: "Align to $69.99", impact: "+5% conversion", confidence: 0.85, status: "PENDING", createdAt: new Date().toISOString() }
        ];

        for (const r of initialRecs) {
          batch.set(doc(collection(db, 'recommendations')), r);
        }

        await batch.commit().catch(e => handleFirestoreError(e, OperationType.WRITE, 'batch seeding'));
        console.log("Synthetic data seeded.");
      }
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    seedData();

    // Listeners
    const metricPath = 'config/metrics';
    const unsubMetrics = onSnapshot(doc(db, metricPath), (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setMetrics({
          revenue: { 
            daily: d.dailyRevenue, 
            target: d.revenueTarget, 
            trend: d.revenueTrend, 
            history1H: d.revenueHistory1H,
            history24H: d.revenueHistory24H,
            history7D: d.revenueHistory7D
          },
          inventory: { stockoutRate: d.stockoutRate, overstockValue: d.overstockValue, health: d.inventoryHealth },
          customers: { active30d: d.active30d, churnRisk: d.churnRisk, nps: d.nps, segments: d.customerSegments },
          storeOps: d.storeOps
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, metricPath));

    const recsPath = 'recommendations';
    const q = query(collection(db, recsPath), where('status', '==', 'PENDING'));
    const unsubRecs = onSnapshot(q, (snapshot) => {
      const recs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecommendations(recs);
    }, (error) => handleFirestoreError(error, OperationType.GET, recsPath));

    return () => {
      unsubMetrics();
      unsubRecs();
    };
  }, [user]);

  const handleExecute = async (id: string) => {
    const recPath = `recommendations/${id}`;
    try {
      await updateDoc(doc(db, 'recommendations', id), {
        status: 'EXECUTED'
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, recPath));
      
      const currentMetricsRef = doc(db, 'config', 'metrics');
      const snap = await getDoc(currentMetricsRef).catch(e => {
        handleFirestoreError(e, OperationType.GET, 'config/metrics');
        return null;
      });
      
      if (snap && snap.exists()) {
        const data = snap.data();
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}`;
        
        const newHistory1H = [...(data.revenueHistory1H || []), { name: timeStr, value: (data.revenueHistory1H?.slice(-1)[0]?.value || 1400) + 200 }].slice(-60);
        
        await updateDoc(currentMetricsRef, {
          dailyRevenue: data.dailyRevenue + 1250,
          stockoutRate: Math.max(0, data.stockoutRate - 0.2),
          revenueTrend: "+5.4%",
          revenueHistory1H: newHistory1H,
          'storeOps.dataCapacity': Math.min(100, (data.storeOps?.dataCapacity || 50) + 2)
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'config/metrics'));
      }
    } catch (err) {
      console.error("Execute failed", err);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Executive Pulse' },
    { id: 'workbench', icon: ShoppingCart, label: 'AI Merchant' },
    { id: 'operations', icon: Activity, label: 'Store Ops' },
  ];

  const handleCompleteTask = async (taskId: string) => {
    try {
      const metricsRef = doc(db, 'config', 'metrics');
      const snap = await getDoc(metricsRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedTasks = data.storeOps.tasks.map((t: any) => 
          t.id === taskId ? { ...t, status: 'COMPLETED' } : t
        );
        await updateDoc(metricsRef, {
          'storeOps.tasks': updatedTasks,
          'storeOps.occupancy': Math.max(0, data.storeOps.occupancy - (taskId === 'T1' ? 10 : 0)),
          'storeOps.dataCapacity': Math.max(0, (data.storeOps.dataCapacity || 70) - 5)
        });
      }
    } catch (err) {
      console.error("Task completion failed", err);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
            <Database className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">RetailAI Intelligence</h1>
          <p className="text-slate-500 mb-8">Access the unified semantic layer and AI merchandising engine.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Sign in with Google
          </button>
          <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure Enterprise Access Required</p>
        </motion.div>
      </div>
    );
  }

   return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col h-full transition-all"
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 card-gradient rounded-lg shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0">
            <Database className="text-white" size={18} />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-slate-800"
            >
              InsightFlow
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group font-medium",
                activeView === item.id 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon size={20} className={cn(activeView === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-900")} />
              {isSidebarOpen && <span>{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {isSidebarOpen && (
          <div className="p-6 mx-4 mb-6 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Data Capacity</p>
            <div className="h-2 bg-slate-700 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-indigo-500 w-[64%]"></div>
            </div>
            <p className="text-[10px] text-slate-300">6.4 GB / 10 GB used</p>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">Collapse Menu</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <header className="flex justify-between items-center py-6 px-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 capitalize">
              {activeView === 'dashboard' ? 'Operational Intelligence' : activeView.replace('view', '')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => seedData(true)}
              disabled={isSeeding}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {isSeeding ? 'Syncing...' : 'Reset Demo'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
              System Health: Optimal
            </div>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-indigo-100" 
              alt="User" 
            />
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
            {activeView === 'dashboard' && (
                metrics ? <ExecutiveDashboard data={metrics} /> : (
                  <div className="p-20 text-center">
                    <button 
                      onClick={() => seedData()}
                      disabled={isSeeding}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isSeeding ? 'Seeding Data Lake...' : 'Initialize Demo Data'}
                    </button>
                    <p className="text-slate-400 text-sm mt-4">Database is empty. Click to populate the prototype.</p>
                  </div>
                )
              )}
              {activeView === 'workbench' && <MerchantWorkbench recommendations={recommendations} onExecute={handleExecute} />}
              {activeView === 'operations' && <StoreOperations data={metrics?.storeOps} onCompleteTask={handleCompleteTask} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global AI Copilot Overlay */}
      <StoreCopilot />
    </div>
  );
}

