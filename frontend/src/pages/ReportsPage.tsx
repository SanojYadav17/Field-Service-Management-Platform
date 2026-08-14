import React, { useEffect, useState } from 'react';
import { AnalyticsReport } from '../types';
import { api } from '../services/api';
import {
  BarChart3,
  Trophy,
  Download,
  ShieldAlert,
  PackageCheck,
  Clock,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  IndianRupee,
  UserCheck,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsReport();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      await api.downloadWorkOrdersCsv();
    } catch (err: any) {
      alert(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-500 text-xs space-y-3">
        <RefreshCw className="animate-spin text-sky-600" size={24} />
        <span className="font-mono">Aggregating field telemetry & analytics report...</span>
      </div>
    );
  }

  const { technicianLeaderboard, slaPriorityBreakdown, topInventoryConsumption, summary } = analytics!;

  return (
    <div className="space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics & Reports Dashboard</h1>
              <p className="text-xs text-slate-500">Technician leaderboard, priority SLA compliance, and parts consumption audit</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={loadData} className="ks-btn-secondary text-xs h-9 px-3.5 shadow-2xs">
            <RefreshCw size={14} className={loading ? 'animate-spin text-sky-600' : 'text-sky-600'} /> Refresh
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="ks-btn-primary text-xs h-9 px-4 shadow-2xs flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>{downloading ? 'Exporting...' : 'Export Work Orders (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Service Tickets</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{summary.totalWorkOrders}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span><strong>{summary.completedWorkOrders}</strong> Completed</span>
              <span className="text-amber-600 font-semibold"><strong>{summary.openWorkOrders}</strong> Active</span>
            </div>
          </div>

          <div className="glass-card p-4 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall SLA Compliance</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldAlert size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">{summary.overallSlaCompliance}%</div>
            <div className="text-xs text-slate-500 mt-2">Target SLA Compliance: 95.0%</div>
          </div>

          <div className="glass-card p-4 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inventory Asset Value</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <IndianRupee size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-indigo-600 mt-2 font-mono">
              ₹{summary.totalPartsValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-2">Active Spare Parts Valuation</div>
          </div>

          <div className="glass-card p-4 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Field Labour</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-2 font-mono">{summary.totalLabourHours} hrs</div>
            <div className="text-xs text-slate-500 mt-2">Logged by Technicians</div>
          </div>
        </div>
      )}

      {/* Technician Leaderboard Section */}
      <div className="glass-card p-6 border border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <h2 className="font-extrabold text-base text-slate-900">Technician Performance Leaderboard</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Ranked by tickets completed & SLA efficiency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicianLeaderboard.map((tech, idx) => {
            const isTop3 = idx < 3;
            const rankBadges = ['🥇 #1 Top Performer', '🥈 #2 Specialist', '🥉 #3 Field Tech'];
            return (
              <div
                key={tech.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  idx === 0
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                      {tech.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{tech.fullName}</h3>
                      <p className="text-[11px] text-slate-500 truncate">{tech.email}</p>
                    </div>
                  </div>
                  {isTop3 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xs">
                      {rankBadges[idx]}
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Completed</div>
                    <div className="font-mono font-black text-slate-900 text-base">{tech.completedTickets}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Time</div>
                    <div className="font-mono font-bold text-sky-600 text-xs mt-1">{tech.avgResolutionHours}h</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Labour</div>
                    <div className="font-mono font-bold text-amber-600 text-xs mt-1">{Math.round(tech.totalLabourMinutes / 60)}h</div>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-600">SLA Efficiency Rating</span>
                    <span className="text-emerald-600">{tech.efficiencyRating}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${tech.efficiencyRating}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA Priority Breakdown & Parts Expenditure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Priority Breakdown */}
        <div className="glass-card p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={17} className="text-sky-600" />
              <h2 className="font-extrabold text-sm text-slate-900">SLA Compliance by Priority</h2>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Priority Tiers
            </span>
          </div>

          <div className="space-y-3.5">
            {slaPriorityBreakdown.map((sla) => (
              <div key={sla.priority} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`badge ${
                    sla.priority === 'URGENT' ? 'badge-urgent' :
                    sla.priority === 'HIGH' ? 'badge-high' :
                    sla.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                  }`}>
                    {sla.priority} Priority
                  </span>
                  <span className="font-mono text-xs font-black text-slate-800">
                    {sla.metCount} / {sla.totalTickets} Met ({sla.complianceRate}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sla.complianceRate >= 80 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sla.complianceRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Inventory Parts Consumption */}
        <div className="glass-card p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PackageCheck size={17} className="text-indigo-600" />
              <h2 className="font-extrabold text-sm text-slate-900">Top Parts Consumption & Audit</h2>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {topInventoryConsumption.length} SKUs Catalog
            </span>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
            <table className="ks-table text-xs">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>SKU</th>
                  <th>Qty Used</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {topInventoryConsumption.map((p) => (
                  <tr key={p.partId}>
                    <td className="font-bold text-slate-900">{p.partName}</td>
                    <td>
                      <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {p.sku}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-slate-800">{p.totalQtyUsed}</td>
                    <td className="font-mono font-bold text-emerald-600">₹{p.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
