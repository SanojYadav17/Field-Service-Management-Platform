import React, { useEffect, useState } from 'react';
import { Part } from '../types';
import { api } from '../services/api';
import { Package, Plus, AlertTriangle, X, IndianRupee, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InventoryManagementPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(10);
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handlePartNameChange = (val: string) => {
    setName(val);
    const code = `PRT-${val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}`;
    setSku(code);
  };

  // Restock state
  const [restockPartId, setRestockPartId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const loadParts = async () => {
    setLoading(true);
    try {
      const data = await api.getParts();
      setParts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createPart({ name, sku, unitCost, stockQty, minStockLevel });
      setShowModal(false);
      setName(''); setSku(''); setUnitCost(0); setStockQty(10);
      loadParts();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleRestock = async (id: number) => {
    try {
      await api.restockPart(id, restockQty);
      setRestockPartId(null);
      loadParts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const lowStockCount = parts.filter(p => p.stockQty <= p.minStockLevel).length;
  const totalValuation = parts.reduce((acc, p) => acc + (p.stockQty * p.unitCost), 0);

  return (
    <div className="space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory & Parts Control</h1>
              <p className="text-xs text-slate-500">Real-time stock decrementing, reorder thresholds, and unit valuation</p>
            </div>
          </div>
        </div>
        {(hasRole('ADMIN') || hasRole('DISPATCHER')) && (
          <button onClick={() => setShowModal(true)} className="ks-btn-primary h-9 text-xs px-4">
            <Plus size={15} /> Add Inventory Part
          </button>
        )}
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-slate-200 flex items-center justify-between bg-white shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Part SKUs</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{parts.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
            <Layers size={20} />
          </div>
        </div>

        <div className="glass-card p-4 border border-slate-200 flex items-center justify-between bg-white shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</div>
            <div className={`text-2xl font-black mt-1 font-mono ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{lowStockCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="glass-card p-4 border border-slate-200 flex items-center justify-between bg-white shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Asset Valuation</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <IndianRupee size={20} />
          </div>
        </div>
      </div>

      {/* Main SaaS Data Table */}
      <div className="glass-card border border-slate-200 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="ks-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>SKU Code</th>
                <th>Unit Cost</th>
                <th>Stock Level</th>
                <th>Min Threshold</th>
                <th>Status</th>
                {(hasRole('ADMIN') || hasRole('DISPATCHER')) && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {parts.map(p => {
                const isLow = p.stockQty <= p.minStockLevel;
                return (
                  <tr key={p.id}>
                    <td className="font-bold text-slate-900">{p.name}</td>
                    <td>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {p.sku}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-emerald-600">₹{p.unitCost.toFixed(2)}</td>
                    <td className="font-mono font-black text-sm text-slate-900">{p.stockQty}</td>
                    <td className="text-slate-500 font-mono">{p.minStockLevel}</td>
                    <td>
                      {isLow ? (
                        <span className="badge badge-urgent inline-flex items-center gap-1">
                          <AlertTriangle size={11} /> Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-completed">In Stock</span>
                      )}
                    </td>
                    {(hasRole('ADMIN') || hasRole('DISPATCHER')) && (
                      <td className="text-right">
                        {restockPartId === p.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min="1"
                              value={restockQty}
                              onChange={e => setRestockQty(Number(e.target.value))}
                              className="ks-input-plain w-20 py-1 text-xs h-8"
                            />
                            <button onClick={() => handleRestock(p.id)} className="ks-btn-primary h-8 text-xs px-3">Confirm</button>
                            <button onClick={() => setRestockPartId(null)} className="ks-btn-secondary h-8 text-xs px-3">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setRestockPartId(p.id)} className="ks-btn-secondary h-8 text-xs px-3">
                            Restock
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card w-full max-w-lg p-6 space-y-5 border border-slate-200 shadow-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Spare Part to Inventory</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            {formError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{formError}</div>}
            
            <form onSubmit={handleCreatePart} className="space-y-4 text-xs">
              <div>
                <label className="ks-label">Part Name *</label>
                <input type="text" value={name} onChange={e => handlePartNameChange(e.target.value)} className="ks-input-plain" required />
              </div>
              <div>
                <label className="ks-label">SKU Code *</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="ks-input-plain" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="ks-label">Unit Cost (₹)</label>
                  <input type="number" step="0.01" value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} className="ks-input-plain" required />
                </div>
                <div>
                  <label className="ks-label">Initial Stock</label>
                  <input type="number" value={stockQty} onChange={e => setStockQty(Number(e.target.value))} className="ks-input-plain" required />
                </div>
                <div>
                  <label className="ks-label">Min Threshold</label>
                  <input type="number" value={minStockLevel} onChange={e => setMinStockLevel(Number(e.target.value))} className="ks-input-plain" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="ks-btn-secondary">Cancel</button>
                <button type="submit" className="ks-btn-primary w-auto px-6">Save Part</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
