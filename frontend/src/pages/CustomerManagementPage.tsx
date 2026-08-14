import React, { useEffect, useState } from 'react';
import { Customer, Site } from '../types';
import { api } from '../services/api';
import { Building2, Plus, Mail, Phone, MapPin, X, Building, Map, Search } from 'lucide-react';
import { AddressInput } from '../components/AddressInput';

interface CustomerManagementPageProps {
  viewMode?: 'customers' | 'sites' | 'all';
}

export const CustomerManagementPage: React.FC<CustomerManagementPageProps> = ({ viewMode = 'all' }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'customer' | 'site'>('customer');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [contactPerson, setContactPerson] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate code when company name changes if code is blank or auto-generated
  const handleNameChange = (val: string) => {
    setName(val);
    const generated = `CUST-${val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)}`;
    setCode(generated);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, sList] = await Promise.all([
        api.getCustomers(),
        api.getSites(),
      ]);
      setCustomers(cList);
      setSites(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createCustomer({
        name,
        code,
        contactEmail: email,
        contactPhone: phone,
        address,
      });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    setFormError(null);
    try {
      await api.createSite({
        name,
        address,
        customerId: Number(selectedCustomerId),
        contactPerson,
      });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSelectedCustomerId('');
    setContactPerson('');
    setFormError(null);
  };

  const isCustomersOnly = viewMode === 'customers';
  const isSitesOnly = viewMode === 'sites';

  return (
    <div className="space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              {isSitesOnly ? <MapPin size={20} /> : <Building2 size={20} />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {isCustomersOnly ? 'Client Customer Organizations' : isSitesOnly ? 'Facility Building Sites' : 'Customers & Facility Sites'}
              </h1>
              <p className="text-xs text-slate-500">
                {isCustomersOnly
                  ? 'Manage client accounts, billing contacts, HQ addresses, and organization codes'
                  : isSitesOnly
                  ? 'Manage physical building sites, customer site assignments, and on-site contact persons'
                  : 'Manage client organizations, billing contacts, and building locations'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {(!isSitesOnly) && (
            <button
              onClick={() => { setModalType('customer'); resetForm(); setShowModal(true); }}
              className="ks-btn-primary h-9 text-xs px-4"
            >
              <Plus size={15} /> Add Customer
            </button>
          )}
          {(!isCustomersOnly) && (
            <button
              onClick={() => { setModalType('site'); resetForm(); setShowModal(true); }}
              className={isSitesOnly ? "ks-btn-primary h-9 text-xs px-4" : "ks-btn-secondary h-9 text-xs px-4"}
            >
              <Plus size={15} /> Add Site
            </button>
          )}
        </div>
      </div>

      <div className={isCustomersOnly || isSitesOnly ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
        {/* Customers List Card */}
        {(!isSitesOnly) && (
          <div className="glass-card p-5 border border-slate-200 space-y-4 shadow-xs bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-sky-600" />
                <h2 className="font-extrabold text-sm text-slate-900">Client Organizations</h2>
              </div>
              <span className="text-xs font-bold text-sky-700 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200">
                {customers.length} Accounts
              </span>
            </div>

            <div className={isCustomersOnly ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3 max-h-[620px] overflow-y-auto pr-1"}>
              {customers.map(c => (
                <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 hover:border-sky-300 transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                      {c.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                    <div className="flex items-center gap-2"><Mail size={13} className="text-slate-400 shrink-0" /> <span className="truncate">{c.contactEmail}</span></div>
                    {c.contactPhone && <div className="flex items-center gap-2"><Phone size={13} className="text-slate-400 shrink-0" /> <span>{c.contactPhone}</span></div>}
                    {c.address && <div className="flex items-center gap-2"><MapPin size={13} className="text-slate-400 shrink-0" /> <span className="truncate">{c.address}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sites List Card */}
        {(!isCustomersOnly) && (
          <div className="glass-card p-5 border border-slate-200 space-y-4 shadow-xs bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Map size={16} className="text-indigo-600" />
                <h2 className="font-extrabold text-sm text-slate-900">Building Sites</h2>
              </div>
              <span className="text-xs font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                {sites.length} Locations
              </span>
            </div>

            <div className={isSitesOnly ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3 max-h-[620px] overflow-y-auto pr-1"}>
              {sites.map(s => (
                <div key={s.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 hover:border-indigo-300 transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">{s.customerName}</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                    <div className="flex items-center gap-2"><MapPin size={13} className="text-slate-400 shrink-0" /> <span className="truncate">{s.address}</span></div>
                    {s.contactPerson && <div className="text-slate-500">On-site Contact: <strong className="text-slate-800">{s.contactPerson}</strong></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card w-full max-w-lg p-6 space-y-5 border border-slate-200 shadow-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {modalType === 'customer' ? 'Create New Customer Organization' : 'Create New Site Location'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={modalType === 'customer' ? handleCreateCustomer : handleCreateSite} className="space-y-4 text-xs">
              {modalType === 'customer' ? (
                <>
                  <div>
                    <label className="ks-label">Company Name *</label>
                    <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} className="ks-input-plain" required />
                  </div>
                  <div>
                    <label className="ks-label">Unique Code (e.g. CUST-ACME) *</label>
                    <input type="text" value={code} onChange={e => setCode(e.target.value)} className="ks-input-plain" required />
                  </div>
                  <div>
                    <label className="ks-label">Contact Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="ks-input-plain" required />
                  </div>
                  <div>
                    <label className="ks-label">Contact Phone</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="ks-input-plain" />
                  </div>
                  <div>
                    <label className="ks-label">HQ Address</label>
                    <AddressInput value={address} onChange={setAddress} placeholder="Enter HQ street address..." />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="ks-label">Belongs to Customer Organization *</label>
                    <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(Number(e.target.value))} className="ks-select" required>
                      <option value="">Select Customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="ks-label">Site/Building Name *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="ks-input-plain" required />
                  </div>
                  <div>
                    <label className="ks-label">Full Address *</label>
                    <AddressInput value={address} onChange={setAddress} placeholder="Enter building site address..." required />
                  </div>
                  <div>
                    <label className="ks-label">On-Site Contact Person</label>
                    <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="ks-input-plain" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="ks-btn-secondary">Cancel</button>
                <button type="submit" className="ks-btn-primary w-auto px-6">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
