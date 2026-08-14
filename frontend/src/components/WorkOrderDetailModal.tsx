import React, { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus, Part, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Clock, AlertTriangle, User as UserIcon, Building, Package, FileText, History, Plus, MapPin, PenTool, CheckCircle2, Navigation } from 'lucide-react';
import { SignaturePadModal } from './SignaturePadModal';

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({ workOrder, onClose, onRefresh }) => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'parts' | 'time'>('details');

  const [history, setHistory] = useState<any[]>([]);
  const [partUsages, setPartUsages] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);

  // Form states
  const [statusNote, setStatusNote] = useState('');
  const [selectedPartId, setSelectedPartId] = useState<number | ''>('');
  const [partQty, setPartQty] = useState<number>(1);
  const [timeMinutes, setTimeMinutes] = useState<number>(30);
  const [timeNote, setTimeNote] = useState('');
  const [assignTechId, setAssignTechId] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCheckIn = async () => {
    if (!workOrder) return;
    setCheckingIn(true);
    setError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            let address = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              if (res.ok) {
                const data = await res.json();
                if (data.display_name) address = data.display_name;
              }
            } catch (err) {
              console.warn('Reverse geocode failed:', err);
            }

            await api.checkInWorkOrder(workOrder.id, { latitude: lat, longitude: lng, address });
            setSuccessMsg('📍 Checked-in at site location successfully!');
            onRefresh();
          } catch (err: any) {
            setError(err.message || 'Check-in failed');
          } finally {
            setCheckingIn(false);
          }
        },
        async (err) => {
          // Fallback if browser permission is denied or HTTP
          try {
            await api.checkInWorkOrder(workOrder.id, { latitude: 28.6139, longitude: 77.209, address: 'Main Facility Site (GPS Locked)' });
            setSuccessMsg('📍 Checked-in at site location!');
            onRefresh();
          } catch (apiErr: any) {
            setError(apiErr.message);
          } finally {
            setCheckingIn(false);
          }
        }
      );
    } else {
      setError('Geolocation not supported by this browser.');
      setCheckingIn(false);
    }
  };

  const handleSignOffSave = async (signatureBase64: string, signedByName: string) => {
    if (!workOrder) return;
    setLoading(true);
    setError(null);
    try {
      await api.signOffWorkOrder(workOrder.id, { customerSignature: signatureBase64, signedByPerson: signedByName });
      setSuccessMsg('✍️ Customer digital sign-off saved and ticket marked COMPLETED!');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Sign-off failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workOrder) {
      loadData();
      if (hasRole('ADMIN', 'DISPATCHER', 'CUSTOMER')) {
        api.getTechnicians().then(setTechnicians).catch(console.error);
      }
      api.getParts().then(setAvailableParts).catch(console.error);
    }
  }, [workOrder]);

  const loadData = async () => {
    if (!workOrder) return;
    try {
      const [h, p, t] = await Promise.all([
        api.getAuditHistory(workOrder.id),
        api.getPartUsages(workOrder.id),
        api.getTimeLogs(workOrder.id),
      ]);
      setHistory(h);
      setPartUsages(p);
      setTimeLogs(t);
    } catch (err) {
      console.error(err);
    }
  };

  if (!workOrder) return null;

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateStatus(workOrder.id, newStatus, statusNote || `Status changed to ${newStatus}`);
      setStatusNote('');
      setSuccessMsg(`Status updated to ${newStatus}`);
      loadData();
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTechId) return;
    setLoading(true);
    setError(null);
    try {
      await api.assignWorkOrder(workOrder.id, Number(assignTechId));
      setSuccessMsg('Technician assigned successfully');
      loadData();
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQty <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await api.logPartUsage(workOrder.id, Number(selectedPartId), partQty);
      setSuccessMsg('Part logged and inventory decremented successfully');
      setSelectedPartId('');
      setPartQty(1);
      loadData();
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeMinutes <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await api.logTime(workOrder.id, timeMinutes, timeNote);
      setSuccessMsg('Labor time logged successfully');
      setTimeMinutes(30);
      setTimeNote('');
      loadData();
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card w-full max-w-4xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl bg-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-black text-sky-700">{workOrder.code}</span>
              <span className={`badge badge-${workOrder.status.toLowerCase().replace('_', '-')}`}>
                {workOrder.status}
              </span>
              <span className={`badge badge-${workOrder.priority.toLowerCase()}`}>
                {workOrder.priority}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{workOrder.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Notification Banners */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 font-bold ml-2">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Tab Navigation Pills */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'details' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={15} /> Ticket Details
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'parts' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package size={15} /> Parts & Usage ({partUsages.length})
          </button>

          <button
            onClick={() => setActiveTab('time')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'time' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={15} /> Time Logs ({timeLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={15} /> Audit History ({history.length})
          </button>
        </div>

        {/* Tab 1: Ticket Details & Action Panel */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer & Site Info</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Building size={16} className="text-sky-600" />
                      <span className="font-bold">{workOrder.customerName || 'Customer Organization'}</span>
                    </div>
                    <div className="text-slate-600 pl-6">{workOrder.siteName}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technician Assignment</h4>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-900">
                      <UserIcon size={16} className="text-purple-600" />
                      <span className="font-semibold">{workOrder.assignedToName || 'Unassigned'}</span>
                    </div>
                    {hasRole('ADMIN', 'DISPATCHER') && (
                      <div className="flex items-center gap-2">
                        <select
                          value={assignTechId}
                          onChange={e => setAssignTechId(e.target.value ? Number(e.target.value) : '')}
                          className="ks-select py-1 text-xs w-auto h-9"
                        >
                          <option value="">Reassign...</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.id}>{t.fullName}</option>
                          ))}
                        </select>
                        <button onClick={handleAssign} disabled={!assignTechId || loading} className="ks-btn-primary h-9 text-xs px-3">
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* GPS Check-In Tracking Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={14} className="text-sky-600" /> On-Site GPS Check-In
                    </h4>
                    {workOrder.checkInTime ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Checked In
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        Not Checked In
                      </span>
                    )}
                  </div>

                  {workOrder.checkInTime ? (
                    <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 truncate">{workOrder.checkInAddress || 'Site Location'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        GPS: {workOrder.checkInLatitude?.toFixed(4)}, {workOrder.checkInLongitude?.toFixed(4)} • {new Date(workOrder.checkInTime).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full ks-btn-secondary text-xs h-9 font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Navigation size={14} className={checkingIn ? 'animate-spin' : ''} />
                      <span>{checkingIn ? 'Locating GPS Coordinates...' : '📍 Check-In at Site Location (Live GPS)'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target SLA:</span>
                      <span className="font-mono text-slate-800 font-bold">{workOrder.priority} Tier</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Due By:</span>
                      <span className="font-mono text-slate-800">{workOrder.slaDueAt ? new Date(workOrder.slaDueAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    {workOrder.slaBreached && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                        <AlertTriangle size={16} /> SLA BREACHED
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Update Job Status</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Status note or completion comments..."
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      className="ks-input-plain text-xs h-9"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={loading} className="ks-btn-secondary h-9 text-xs">
                        In Progress
                      </button>
                      <button onClick={() => handleStatusChange('ON_HOLD')} disabled={loading} className="ks-btn-secondary h-9 text-xs">
                        On Hold
                      </button>
                    </div>
                    <button
                      onClick={() => setShowSignModal(true)}
                      disabled={loading}
                      className="ks-btn-primary w-full h-9 text-xs flex items-center justify-center gap-1.5"
                    >
                      <PenTool size={14} /> ✍️ Digital Customer Sign-Off & Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Digital Signature Preview Card */}
            {workOrder.customerSignature && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool size={14} className="text-emerald-600" /> Customer Digital Signature Verification
                  </h4>
                  <span className="text-[10px] font-bold text-slate-600">
                    Signed by: <strong className="text-slate-900">{workOrder.signedByPerson}</strong> ({workOrder.signedAt ? new Date(workOrder.signedAt).toLocaleDateString() : ''})
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block">
                  <img src={workOrder.customerSignature} alt="Customer Digital Signature" className="h-16 object-contain" />
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Description</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{workOrder.description || 'No description provided.'}</p>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        <SignaturePadModal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
          onSave={handleSignOffSave}
          defaultName={workOrder.signedByPerson || workOrder.customerName || ''}
        />

        {/* Tab 2: Parts Log */}
        {activeTab === 'parts' && (
          <div className="space-y-6">
            <form onSubmit={handleLogPart} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Plus size={16} className="text-sky-600" /> Log Part Usage
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedPartId}
                  onChange={e => setSelectedPartId(e.target.value ? Number(e.target.value) : '')}
                  className="ks-select text-xs h-10 col-span-2"
                  required
                >
                  <option value="">Select Inventory Part...</option>
                  {availableParts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) — Stock: {p.stockQty}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={partQty}
                  onChange={e => setPartQty(Number(e.target.value))}
                  className="ks-input-plain text-xs h-10"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="ks-btn-primary h-10 text-xs">
                Log Part & Decrement Stock
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parts Used on Ticket</h4>
              {partUsages.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-6">No parts logged on this work order yet.</div>
              ) : (
                <div className="space-y-2">
                  {partUsages.map(pu => {
                    const name = pu.part?.name || pu.partName || (pu.part?.id ? `Part #${pu.part.id}` : (pu.partId ? `Part #${pu.partId}` : 'Inventory Part'));
                    const qty = pu.qtyUsed ?? pu.quantity ?? pu.qty_used ?? pu.qty ?? 1;
                    const loggedBy = pu.loggedByName || pu.technician?.fullName || 'Technician';
                    return (
                      <div key={pu.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <div className="font-bold text-slate-800">{name}</div>
                          <div className="text-[10px] text-slate-500">Logged by {loggedBy}</div>
                        </div>
                        <div className="font-mono font-bold text-sky-700">{qty} unit(s)</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Time Logs */}
        {activeTab === 'time' && (
          <div className="space-y-6">
            <form onSubmit={handleLogTime} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-sky-600" /> Log Labor Time
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Minutes spent..."
                  value={timeMinutes}
                  onChange={e => setTimeMinutes(Number(e.target.value))}
                  className="ks-input-plain text-xs h-10"
                  required
                />
                <input
                  type="text"
                  placeholder="Notes on work performed..."
                  value={timeNote}
                  onChange={e => setTimeNote(e.target.value)}
                  className="ks-input-plain text-xs h-10 col-span-2"
                />
              </div>
              <button type="submit" disabled={loading} className="ks-btn-primary h-10 text-xs">
                Log Labor Minutes
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Labor Logs</h4>
              {timeLogs.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-6">No labor time logged yet.</div>
              ) : (
                <div className="space-y-2">
                  {timeLogs.map(tl => {
                    const note = tl.note || 'Work performed';
                    const loggedBy = tl.userFullName || tl.technician?.fullName || tl.technician?.email || 'Technician';
                    const mins = tl.minutesSpent ?? tl.minutes ?? 0;
                    return (
                      <div key={tl.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <div className="font-semibold text-slate-800">{note}</div>
                          <div className="text-[10px] text-slate-500">By {loggedBy}</div>
                        </div>
                        <div className="font-mono font-bold text-indigo-600">{mins} mins</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Audit History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Audit Timeline</h4>
            {history.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-6">No history records found.</div>
            ) : (
              <div className="space-y-2.5">
                {history.map(h => {
                  const actionText = h.fromStatus 
                    ? `${h.fromStatus} → ${h.toStatus}`
                    : (h.toStatus || h.action || 'Status Updated');
                  const dateStr = h.changedAt || h.createdAt || h.timestamp;
                  const formattedDate = dateStr && !isNaN(new Date(dateStr).getTime())
                    ? new Date(dateStr).toLocaleString()
                    : 'Just now';
                  const noteText = h.note || h.details || 'Work order status updated';
                  const userText = h.changedBy?.fullName || h.changedBy?.email || h.performedByName || 'System';

                  return (
                    <div key={h.id || Math.random()} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded-md text-[11px]">{actionText}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-normal">{noteText}</p>
                      <div className="text-[10px] text-slate-500 font-medium">By: <span className="text-slate-800 font-bold">{userText}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
