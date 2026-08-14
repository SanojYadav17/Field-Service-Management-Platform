import React, { useState, useEffect } from 'react';
import { Customer, Site, User, Priority } from '../types';
import { api } from '../services/api';
import { AddressInput } from './AddressInput';
import { X, PlusCircle, AlertTriangle, MapPin, Plus } from 'lucide-react';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [siteId, setSiteId] = useState<number | '' | 'NEW'>('');
  const [assignedToId, setAssignedToId] = useState<number | ''>('');

  // Custom inline site states
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCustomers().then(setCustomers).catch(console.error);
      api.getTechnicians().then(setTechnicians).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (customerId) {
      api.getSitesByCustomer(Number(customerId)).then(fetchedSites => {
        setSites(fetchedSites);
        if (fetchedSites.length > 0) {
          setSiteId(fetchedSites[0].id);
        } else {
          setSiteId('NEW');
          const selectedCust = customers.find(c => c.id === Number(customerId));
          setNewSiteName(selectedCust ? `${selectedCust.name} Main Site` : 'Main Location');
          setNewSiteAddress(selectedCust?.address || '');
        }
      }).catch(console.error);
    } else {
      setSites([]);
      setSiteId('');
    }
  }, [customerId, customers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !customerId || !siteId) {
      setError('Please fill in all required fields (Title, Customer, Site Location)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalSiteId: number;

      if (siteId === 'NEW') {
        if (!newSiteAddress) {
          setError('Please enter a site address or use current GPS location');
          setLoading(false);
          return;
        }
        const createdSite = await api.createSite({
          name: newSiteName || 'Site Location',
          address: newSiteAddress,
          customerId: Number(customerId),
        });
        finalSiteId = createdSite.id;
      } else {
        finalSiteId = Number(siteId);
      }

      await api.createWorkOrder({
        title,
        description,
        priority,
        customerId: Number(customerId),
        siteId: finalSiteId,
        assignedToId: assignedToId ? Number(assignedToId) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card w-full max-w-xl p-7 space-y-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <PlusCircle size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Create Work Order</h2>
              <p className="text-xs text-slate-500">Dispatch a new field ticket to technicians</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="ks-label">Work Order Title *</label>
            <input
              type="text"
              placeholder="e.g. HVAC Cooling Malfunction on 3rd Floor"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="ks-input-plain"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ks-label">Customer Organization *</label>
              <select
                value={customerId}
                onChange={e => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setCustomerId(val);
                  setSiteId('');
                }}
                className="ks-select"
                required
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="ks-label">Site Location *</label>
              <select
                value={siteId}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'NEW') {
                    setSiteId('NEW');
                    const selectedCust = customers.find(c => c.id === Number(customerId));
                    setNewSiteName(selectedCust ? `${selectedCust.name} Site` : 'New Location');
                  } else {
                    setSiteId(val ? Number(val) : '');
                  }
                }}
                className="ks-select"
                disabled={!customerId}
                required
              >
                <option value="">Select Site Location...</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.address}</option>
                ))}
                {customerId && (
                  <option value="NEW">+ Add New Site Location (Live GPS)</option>
                )}
              </select>
            </div>
          </div>

          {/* Custom New Site Location Inputs with Live GPS */}
          {customerId && siteId === 'NEW' && (
            <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-sky-700 font-semibold text-xs">
                <MapPin size={15} />
                <span>Specify Site Location & Live GPS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ks-label">Site Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Building A / Main Facility"
                    value={newSiteName}
                    onChange={e => setNewSiteName(e.target.value)}
                    className="ks-input-plain text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="ks-label">Location Address / GPS *</label>
                  <AddressInput
                    value={newSiteAddress}
                    onChange={setNewSiteAddress}
                    placeholder="Type address or click Use My Location..."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ks-label">Priority Tier *</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="ks-select"
              >
                <option value="LOW">Low (72h SLA)</option>
                <option value="MEDIUM">Medium (48h SLA)</option>
                <option value="HIGH">High (24h SLA)</option>
                <option value="URGENT">Urgent (4h SLA)</option>
              </select>
            </div>

            <div>
              <label className="ks-label">Assign Technician</label>
              <select
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value ? Number(e.target.value) : '')}
                className="ks-select"
              >
                <option value="">Unassigned (New Ticket)</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="ks-label">Description / Work Details</label>
            <textarea
              rows={3}
              placeholder="Provide job context, equipment serial numbers, or symptoms reported..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="ks-textarea"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="ks-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="ks-btn-primary w-auto px-6">
              {loading ? 'Creating Ticket...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
