import React, { useState, useEffect } from 'react';
import { WorkOrder, Customer, Site, Part, User } from '../types';
import { api } from '../services/api';
import { Search, X, Building2, MapPin, Package, User as UserIcon, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectWorkOrder,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        api.getWorkOrders().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getSites().catch(() => []),
        api.getParts().catch(() => []),
        api.getTechnicians().catch(() => []),
      ]).then(([woList, cList, sList, pList, tList]) => {
        setWorkOrders(woList);
        setCustomers(cList);
        setSites(sList);
        setParts(pList);
        setTechnicians(tList);
        setLoading(false);
      });
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingWorkOrders = q
    ? workOrders.filter(
        w =>
          w.code.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          (w.customerName && w.customerName.toLowerCase().includes(q)) ||
          (w.assignedToName && w.assignedToName.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const matchingCustomers = q
    ? customers.filter(
        c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q))
      ).slice(0, 3)
    : [];

  const matchingSites = q
    ? sites.filter(s => s.name.toLowerCase().includes(q) || (s.address && s.address.toLowerCase().includes(q))).slice(0, 3)
    : [];

  const matchingParts = q
    ? parts.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchingTechs = q
    ? technicians.filter(t => t.fullName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasResults =
    matchingWorkOrders.length > 0 ||
    matchingCustomers.length > 0 ||
    matchingSites.length > 0 ||
    matchingParts.length > 0 ||
    matchingTechs.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card w-full max-w-2xl p-0 overflow-hidden relative border border-slate-200 shadow-2xl bg-white rounded-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3 bg-slate-50/50">
          <Search size={18} className="text-sky-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search work orders, customers, sites, inventory parts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {!q ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <div className="font-mono text-xs text-slate-500">
                Type anything to search across KEYSTONE FSM...
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">WO-1001</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Carrier</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Acme</kbd>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No matching records found for "{query}"
            </div>
          ) : (
            <div className="space-y-4">
              {/* Work Orders Category */}
              {matchingWorkOrders.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <FileText size={12} className="text-sky-600" /> Work Orders ({matchingWorkOrders.length})
                  </div>
                  <div className="space-y-1">
                    {matchingWorkOrders.map(wo => (
                      <div
                        key={wo.id}
                        onClick={() => {
                          onSelectWorkOrder(wo);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-sky-50/70 border border-transparent hover:border-sky-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                            {wo.code}
                          </span>
                          <span className="font-bold text-xs text-slate-900 truncate">{wo.title}</span>
                          <span className={`badge badge-${wo.priority.toLowerCase()} shrink-0`}>
                            {wo.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Open Details <ArrowRight size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Category */}
              {matchingCustomers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <Building2 size={12} className="text-emerald-600" /> Client Organizations ({matchingCustomers.length})
                  </div>
                  <div className="space-y-1">
                    {matchingCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigateTab('customers');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs text-slate-900">{c.name}</span>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{c.code}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Customers <ArrowRight size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sites Category */}
              {matchingSites.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <MapPin size={12} className="text-purple-600" /> Facility Sites ({matchingSites.length})
                  </div>
                  <div className="space-y-1">
                    {matchingSites.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigateTab('sites');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{s.address}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          View Sites <ArrowRight size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Parts Category */}
              {matchingParts.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <Package size={12} className="text-amber-600" /> Inventory Parts ({matchingParts.length})
                  </div>
                  <div className="space-y-1">
                    {matchingParts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigateTab('inventory');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs text-slate-900">{p.name}</span>
                          <span className="font-mono text-[10px] text-sky-700 font-bold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                            {p.sku}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 shrink-0">
                          ₹{p.unitCost} (Stock: {p.stockQty})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technicians Category */}
              {matchingTechs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <UserIcon size={12} className="text-indigo-600" /> Technicians ({matchingTechs.length})
                  </div>
                  <div className="space-y-1">
                    {matchingTechs.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onNavigateTab('users');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900">{t.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{t.email}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          User Directory <ArrowRight size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">ESC</kbd> to close
          </div>
          <div className="flex items-center gap-1">
            <CornerDownLeft size={12} /> Select Item
          </div>
        </div>
      </div>
    </div>
  );
};
