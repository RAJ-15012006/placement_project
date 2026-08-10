import React, { useEffect, useState, Suspense } from 'react';

// Lazy load 3D components to prevent crash if Three.js has peer dep issues
const Hero3DCanvas = React.lazy(() =>
  import('../components/3d/Hero3DCanvas').then((m) => ({ default: m.Hero3DCanvas }))
);
const StockCubeViewer = React.lazy(() =>
  import('../components/3d/StockCubeViewer').then((m) => ({ default: m.StockCubeViewer }))
);
import { Users, Package, FileText, AlertTriangle, TrendingUp, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalCustomers: 3,
    activeCustomers: 2,
    leads: 1,
    totalProducts: 4,
    lowStockProducts: 1,
    totalChallans: 1,
    confirmedChallans: 1,
    draftChallans: 0,
    recentChallans: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/stats`);
        setStats(res.data);
      } catch (err) {
        console.warn('Dashboard fetch fallback demo mode');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* 3D Hero Header Banner */}
      <Suspense fallback={<div style={{height:'220px', background:'linear-gradient(135deg,#0f172a,#0e1a2e)', borderRadius:'1rem', display:'flex', alignItems:'center', justifyContent:'center', color:'#38bdf8', fontWeight:'bold', fontSize:'14px'}}>⚡ Loading 3D Engine...</div>}>
        <Hero3DCanvas />
      </Suspense>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalCustomers}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {stats.activeCustomers} Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">
            Includes {stats.leads} Lead inquiries
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalProducts}</span>
            <span className="text-xs font-semibold text-gray-400">SKUs Listed</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {stats.lowStockProducts} Below Min Stock
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sales Challans</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalChallans}</span>
            <span className="text-xs font-semibold text-emerald-400">{stats.confirmedChallans} Confirmed</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">
            {stats.draftChallans} Drafts pending verification
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-cyan-950/40 to-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Quick Dispatch</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-300">Generate new stock sales challan with automatic stock check.</p>
          <Link
            to="/challans"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all"
          >
            Create Challan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Dashboard Section: 3D Stock Visualizer + Recent Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 3D Stock Visualizer Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Live Inventory Health
            </h3>
            <span className="text-xs text-cyan-400 font-mono">3D ENGINE</span>
          </div>

          <Suspense fallback={<div style={{height:'140px',background:'rgba(15,23,42,0.5)',borderRadius:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:'12px'}}>Loading 3D Visualizer...</div>}>
            <StockCubeViewer stockCount={12} minStock={15} />
          </Suspense>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-rose-300">Low Stock Alert: Stainless Steel Fastener Set M8</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Current Stock: 12 (Minimum Required: 15)</div>
            </div>
          </div>

          <Link
            to="/products"
            className="w-full text-center block py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10 transition-all"
          >
            Manage Warehouse Stock →
          </Link>
        </div>

        {/* Right: Recent Sales Challans Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Recent Sales Challans
            </h3>
            <Link to="/challans" className="text-xs font-bold text-cyan-400 hover:underline">
              View All Challans →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900/60 text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Challan #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Qty</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">CH-2026-0001</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">Sharma Traders Pvt Ltd</div>
                    <div className="text-[10px] text-gray-400">Rajesh Sharma</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">10 Units</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹34,500.00</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
