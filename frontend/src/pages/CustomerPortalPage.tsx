import React, { useEffect, useState, useMemo } from 'react';
import { WorkOrder } from '../types';
import { api } from '../services/api';
import { Users, PlusCircle, Building, ChevronRight, CheckCircle2, RefreshCw, Search, Clock, AlertTriangle, MapPin, PenTool } from 'lucide-react';

interface CustomerPortalPageProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onOpenCreateModal: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onSelectWorkOrder, onOpenCreateModal }) => {
  const [customerOrders, setCustomerOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'urgent'>('all');

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomerWorkOrders();
      setCustomerOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();
  }, []);

  // Calculate KPI stats
  const stats = useMemo(() => {
    const total = customerOrders.length;
    const active = customerOrders.filter(wo => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED').length;
    const completed = customerOrders.filter(wo => wo.status === 'COMPLETED').length;
    const urgent = customerOrders.filter(wo => wo.priority === 'URGENT').length;
    return { total, active, completed, urgent };
  }, [customerOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return customerOrders.filter(wo => {
      const matchesSearch =
        wo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wo.siteName && wo.siteName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterTab === 'active') return wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED';
      if (filterTab === 'completed') return wo.status === 'COMPLETED';
      if (filterTab === 'urgent') return wo.priority === 'URGENT';
      return true;
    });
  }, [customerOrders, searchQuery, filterTab]);

  // Calculate visual stepper progress stage (1 to 4)
  const getStepperStage = (wo: WorkOrder) => {
    if (wo.status === 'COMPLETED') return 4;
    if (wo.status === 'IN_PROGRESS') return wo.checkInTime ? 3 : 2;
    if (wo.assignedToId) return 2;
    return 1;
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Service Portal</h1>
              <p className="text-xs text-slate-500">Track facility service requests, live technician dispatch, and digital sign-offs</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={loadCustomerOrders} className="ks-btn-secondary h-9 text-xs px-3 shadow-2xs">
            <RefreshCw size={14} className={loading ? 'animate-spin text-sky-600' : 'text-sky-600'} />
          </button>
          <button onClick={onOpenCreateModal} className="ks-btn-primary h-9 text-xs px-4 flex-1 sm:flex-initial">
            <PlusCircle size={15} /> Request Service Ticket
          </button>
        </div>
      </div>

      {/* Customer KPI Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Raised</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Facility service requests</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-sky-200 bg-sky-50/40 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Active Queue</div>
          <div className="text-2xl font-black text-sky-700 font-mono">{stats.active}</div>
          <div className="text-[10px] text-sky-600">In-dispatch or in-repair</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{stats.completed}</div>
          <div className="text-[10px] text-emerald-600">Signed-off & closed</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Urgent Tier</div>
          <div className="text-2xl font-black text-amber-700 font-mono">{stats.urgent}</div>
          <div className="text-[10px] text-amber-600">Critical priority tickets</div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({stats.total})
          </button>

          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'active' ? 'bg-white text-sky-700 shadow-xs border border-sky-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({stats.active})
          </button>

          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'completed' ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({stats.completed})
          </button>

          <button
            onClick={() => setFilterTab('urgent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'urgent' ? 'bg-white text-red-700 shadow-xs border border-red-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Urgent ({stats.urgent})
          </button>
        </div>

        <div className="ks-search-wrapper sm:w-64">
          <Search size={15} className="ks-search-icon" />
          <input
            type="text"
            placeholder="Search code, site, title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ks-input-plain ks-search-input text-xs h-9 rounded-xl bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs flex items-center justify-center gap-2 font-mono">
          <RefreshCw className="animate-spin text-sky-600" size={18} />
          <span>Fetching your organization's service requests...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 space-y-4 border border-slate-200 bg-white shadow-xs rounded-2xl">
          <CheckCircle2 className="mx-auto text-sky-600" size={48} />
          <h3 className="font-bold text-lg text-slate-900">No Matching Service Requests</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">No tickets found matching your filter criteria. Click the button above to log a new service ticket.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(wo => {
            const stage = getStepperStage(wo);
            return (
              <div
                key={wo.id}
                onClick={() => onSelectWorkOrder(wo)}
                className="glass-card p-5 rounded-2xl border border-slate-200 hover:border-sky-400 cursor-pointer transition-all space-y-4 shadow-xs bg-white"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-black text-sky-700">{wo.code}</span>
                    <span className={`badge badge-${wo.status.toLowerCase().replace('_', '-')}`}>
                      {wo.status}
                    </span>
                    <span className={`badge badge-${wo.priority.toLowerCase()}`}>
                      {wo.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock size={13} className="text-slate-400" />
                      <span>Due: {wo.slaDueAt ? new Date(wo.slaDueAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {wo.slaBreached && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                        <AlertTriangle size={11} /> Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900">{wo.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{wo.description || 'No detailed description provided.'}</p>
                </div>

                {/* Visual Stepper Progress Bar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className={stage >= 1 ? 'text-sky-700' : ''}>1. Request Submitted</span>
                    <span className={stage >= 2 ? 'text-sky-700' : ''}>2. Tech Assigned</span>
                    <span className={stage >= 3 ? 'text-sky-700' : ''}>3. Site GPS Checked-In</span>
                    <span className={stage >= 4 ? 'text-emerald-700' : ''}>4. Signed & Closed</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-500 ${stage >= 1 ? 'bg-sky-500 w-1/4' : ''}`} />
                    <div className={`h-full transition-all duration-500 ${stage >= 2 ? 'bg-sky-500 w-1/4' : ''}`} />
                    <div className={`h-full transition-all duration-500 ${stage >= 3 ? 'bg-sky-500 w-1/4' : ''}`} />
                    <div className={`h-full transition-all duration-500 ${stage >= 4 ? 'bg-emerald-500 w-1/4' : ''}`} />
                  </div>
                </div>

                {/* Footer Badges & Site Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Building size={14} className="text-slate-400" />
                      <span>{wo.siteName || wo.customerName}</span>
                    </div>

                    {wo.checkInTime && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <MapPin size={12} /> Live Checked In
                      </span>
                    )}

                    {wo.customerSignature && (
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                        <PenTool size={12} /> Digital Sign-Off Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sky-600 font-bold hover:underline self-end sm:self-auto">
                    <span>View Ticket Details</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
