import React, { useEffect, useState } from 'react';
import { WorkOrder } from '../types';
import { api } from '../services/api';
import { Wrench, Clock, Building, CheckCircle2, RefreshCw, ChevronRight, Package } from 'lucide-react';

interface TechnicianFieldPageProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export const TechnicianFieldPage: React.FC<TechnicianFieldPageProps> = ({ onSelectWorkOrder }) => {
  const [myOrders, setMyOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getMyWorkOrders();
      setMyOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <Wrench size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Technician Field Workspace</h1>
              <p className="text-xs text-slate-500">Mobile work order queue, SLA countdowns, and field logging</p>
            </div>
          </div>
        </div>
        <button onClick={loadMyOrders} className="ks-btn-secondary text-xs h-9 px-3.5 shadow-2xs">
          <RefreshCw size={14} className={loading ? 'animate-spin text-sky-600' : 'text-sky-600'} /> Refresh Jobs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs flex items-center justify-center gap-2 font-mono">
          <RefreshCw className="animate-spin text-sky-600" size={18} />
          <span>Fetching assigned field work orders...</span>
        </div>
      ) : myOrders.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 space-y-3 border border-slate-200 bg-white shadow-xs">
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <h3 className="font-bold text-lg text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">There are currently no active field work orders assigned to your account queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(wo => (
            <div
              key={wo.id}
              onClick={() => onSelectWorkOrder(wo)}
              className={`glass-card p-5 rounded-2xl border hover:border-sky-400 cursor-pointer transition-all space-y-3.5 shadow-xs bg-white ${
                wo.slaBreached ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-black text-sky-700">{wo.code}</span>
                  <span className={`badge badge-${wo.status.toLowerCase().replace('_', '-')}`}>
                    {wo.status}
                  </span>
                  <span className={`badge badge-${wo.priority.toLowerCase()}`}>
                    {wo.priority}
                  </span>
                </div>
                <div className="p-1 rounded-lg bg-slate-100 text-slate-500 group-hover:text-sky-600">
                  <ChevronRight size={18} />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{wo.title}</h3>
                {wo.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{wo.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate font-semibold">{wo.siteName || wo.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span>Due: {wo.slaDueAt ? new Date(wo.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Package size={14} className="text-emerald-600" />
                  <span>₹{wo.totalPartsCost} parts</span> • <span>{wo.totalLabourMinutes} m labor</span>
                </div>
              </div>

              {/* Badges for Check-in & Sign-off */}
              <div className="flex items-center gap-2 text-[11px] pt-1">
                {wo.checkInTime ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    📍 GPS Checked In ({new Date(wo.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    📍 Pending GPS Check-In
                  </span>
                )}

                {wo.customerSignature && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                    ✍️ Signed by {wo.signedByPerson}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
