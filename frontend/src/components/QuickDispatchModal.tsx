import React, { useState, useEffect } from 'react';
import { WorkOrder, User } from '../types';
import { api } from '../services/api';
import { X, Zap, UserCheck, AlertTriangle, Building, CheckCircle2 } from 'lucide-react';

interface QuickDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workOrders: WorkOrder[];
}

export const QuickDispatchModal: React.FC<QuickDispatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workOrders,
}) => {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<WorkOrder[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<{ [woId: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Filter unassigned open work orders
      const unassigned = workOrders.filter(
        w => !w.assignedToId && w.status !== 'COMPLETED' && w.status !== 'CANCELLED'
      );
      setUnassignedOrders(unassigned);

      // Load technicians
      api.getTechnicians().then(setTechnicians).catch(console.error);
    }
  }, [isOpen, workOrders]);

  if (!isOpen) return null;

  // Calculate technician workload (active tickets assigned)
  const getTechWorkload = (techId: number) => {
    return workOrders.filter(
      w => w.assignedToId === techId && w.status !== 'COMPLETED' && w.status !== 'CANCELLED'
    ).length;
  };

  const handleSelectTech = (woId: number, techId: number) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [woId]: techId,
    }));
  };

  const handleDispatchSingle = async (woId: number) => {
    const techId = selectedAssignments[woId];
    if (!techId) return;

    setLoading(true);
    setError(null);
    try {
      await api.assignWorkOrder(woId, techId);
      setSuccessMsg(`Ticket dispatched to technician!`);
      setUnassignedOrders(prev => prev.filter(w => w.id !== woId));
      setTimeout(() => setSuccessMsg(null), 3000);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to assign work order');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchAll = async () => {
    const woIdsToDispatch = Object.keys(selectedAssignments).map(Number);
    if (woIdsToDispatch.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        woIdsToDispatch.map(woId => api.assignWorkOrder(woId, selectedAssignments[woId]))
      );
      setSuccessMsg(`All selected tickets dispatched successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Batch dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card w-full max-w-3xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl bg-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
              <Zap size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Quick Dispatch Operations Matrix</h2>
              <p className="text-xs text-slate-500">1-Click technician dispatch for unassigned service tickets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> {successMsg}</span>
          </div>
        )}

        {/* List of Unassigned Work Orders */}
        {unassignedOrders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">All Queue Tickets Dispatched!</h3>
            <p className="text-xs text-slate-500">There are currently no pending unassigned tickets requiring dispatch.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">{unassignedOrders.length} Unassigned Tickets Pending</span>
              {Object.keys(selectedAssignments).length > 0 && (
                <button
                  onClick={handleDispatchAll}
                  disabled={loading}
                  className="ks-btn-primary h-8 text-xs px-3.5 shadow-xs"
                >
                  <Zap size={13} /> Dispatch All Selected ({Object.keys(selectedAssignments).length})
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {unassignedOrders.map(wo => {
                const assignedTechId = selectedAssignments[wo.id] || '';
                return (
                  <div
                    key={wo.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {wo.code}
                        </span>
                        <span className={`badge badge-${wo.priority.toLowerCase()}`}>
                          {wo.priority}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building size={13} className="text-slate-400" />
                        <strong className="text-slate-700">{wo.siteName || wo.customerName}</strong>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{wo.title}</h4>
                      {wo.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{wo.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-slate-600 shrink-0">Assign Tech:</span>
                        <select
                          value={assignedTechId}
                          onChange={e => handleSelectTech(wo.id, Number(e.target.value))}
                          className="ks-select py-1 text-xs h-8 bg-white"
                        >
                          <option value="">Select Technician...</option>
                          {technicians.map(t => {
                            const workload = getTechWorkload(t.id);
                            return (
                              <option key={t.id} value={t.id}>
                                {t.fullName} ({workload} active jobs)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        onClick={() => handleDispatchSingle(wo.id)}
                        disabled={!assignedTechId || loading}
                        className="ks-btn-primary h-8 text-xs px-3 shrink-0"
                      >
                        <UserCheck size={14} /> Dispatch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
