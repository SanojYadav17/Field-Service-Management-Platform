import React, { useEffect, useState } from 'react';
import { DashboardMetrics, WorkOrder } from '../types';
import { api } from '../services/api';
import { KanbanBoard } from '../components/KanbanBoard';
import { QuickDispatchModal } from '../components/QuickDispatchModal';
import { LayoutDashboard, AlertTriangle, ShieldCheck, Package, RefreshCw, ArrowUpRight, Zap } from 'lucide-react';

interface DashboardPageProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectWorkOrder }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickDispatchOpen, setIsQuickDispatchOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setMetrics(null);
    try {
      const [m, wos] = await Promise.all([
        api.getDashboardMetrics(),
        api.getWorkOrders(),
      ]);
      setMetrics(m);
      setWorkOrders(wos);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="p-24 flex flex-col items-center justify-center text-slate-500 text-xs space-y-4">
        <RefreshCw className="animate-spin text-sky-600" size={32} />
        <span className="font-mono font-medium text-slate-600">Refreshing operational telemetry & work orders...</span>
      </div>
    );
  }

  // Count unassigned orders
  const unassignedCount = workOrders.filter(w => !w.assignedToId && w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length;
  const breachedOrders = workOrders.filter(w => w.slaBreached);

  return (
    <div className="space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operations Command Dashboard</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time SLA tracking, dispatch metrics, and field team health</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadData}
            title="Refresh All Dashboard Data"
            disabled={loading}
            className="ks-btn-secondary text-xs h-9 px-3.5 shadow-2xs hover:bg-sky-50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-sky-600' : 'text-sky-600'} />
            <span className="font-semibold text-slate-700">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setIsQuickDispatchOpen(true)}
            className="ks-btn-primary h-9 text-xs px-4 flex-1 sm:flex-initial shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-indigo-600 border-amber-400"
          >
            <Zap size={15} /> ⚡ Quick Dispatch Matrix ({unassignedCount})
          </button>
        </div>
      </div>

      {/* Emergency SLA Breached Alert Banner */}
      {breachedOrders.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-200 text-red-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 text-red-600 border border-red-200 shrink-0">
              <AlertTriangle size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-red-900 flex items-center gap-2">
                <span>🚨 DISPATCH ALERT: {breachedOrders.length} SLA Breached Ticket(s) Detected!</span>
              </div>
              <p className="text-xs text-red-700 mt-0.5">
                Immediate technician assignment & priority dispatch intervention required to restore compliance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickDispatchOpen(true)}
            className="ks-btn-primary text-xs h-8 px-3.5 bg-red-600 hover:bg-red-700 border-red-500 shrink-0"
          >
            Dispatch Unassigned Tickets
          </button>
        </div>
      )}

      {/* Modern SaaS Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border border-slate-200 relative overflow-hidden group hover:border-sky-400 transition-all bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Work Orders</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                <LayoutDashboard size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">{metrics.totalWorkOrders}</div>
            <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span><strong className="text-sky-600 font-bold">{metrics.newWorkOrders}</strong> New</span>
              <span><strong className="text-purple-600 font-bold">{metrics.assignedWorkOrders}</strong> Assigned</span>
            </div>
          </div>

          <div className="glass-card p-5 border border-slate-200 relative overflow-hidden group hover:border-emerald-400 transition-all bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SLA Compliance</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 mt-3 tracking-tight">{metrics.slaComplianceRate}%</div>
            <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px]">Target: 95.0%</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-[11px]">
                Target Met <ArrowUpRight size={13} />
              </span>
            </div>
          </div>

          <div className="glass-card p-5 border border-slate-200 relative overflow-hidden group hover:border-red-400 transition-all bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SLA Breaches</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className={`text-3xl font-black mt-3 tracking-tight ${metrics.slaBreachedCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
              {metrics.slaBreachedCount}
            </div>
            <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              {metrics.slaBreachedCount > 0 ? '⚠️ Dispatcher Intervention Needed' : '✅ Zero Active SLA Breaches'}
            </div>
          </div>

          <div className="glass-card p-5 border border-slate-200 relative overflow-hidden group hover:border-amber-400 transition-all bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Low Stock SKUs</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Package size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-3 tracking-tight">{metrics.lowStockPartsCount}</div>
            <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Parts below reorder thresholds
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Board Header & Kanban View */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Work Order Dispatch Matrix</h2>
            <span className="text-xs font-bold text-sky-700 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200">
              {workOrders.length} Total Tickets
            </span>
          </div>
        </div>
        <KanbanBoard workOrders={workOrders} onSelectWorkOrder={onSelectWorkOrder} onRefresh={loadData} />
      </div>

      {/* Quick Dispatch Modal */}
      <QuickDispatchModal
        isOpen={isQuickDispatchOpen}
        onClose={() => setIsQuickDispatchOpen(false)}
        onSuccess={loadData}
        workOrders={workOrders}
      />
    </div>
  );
};
