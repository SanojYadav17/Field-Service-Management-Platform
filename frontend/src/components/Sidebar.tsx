import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wrench, Users, Package, Building2, MapPin, UserCog, PlusCircle, ShieldCheck, BarChart3 } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreateModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onOpenCreateModal }) => {
  const { hasRole } = useAuth();

  const isManagerOrDispatcher = hasRole('ADMIN', 'DISPATCHER');
  const isTechnician = hasRole('TECHNICIAN');
  const isCustomer = hasRole('CUSTOMER');

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-56px)] select-none shadow-xs">
      <div className="space-y-6">
        {onOpenCreateModal && (isManagerOrDispatcher || isCustomer) && (
          <button
            onClick={onOpenCreateModal}
            className="ks-btn-primary w-full flex items-center justify-center gap-2.5 py-3 shadow-md shadow-sky-500/20 group relative overflow-hidden"
          >
            <PlusCircle size={18} className="transition-transform group-hover:rotate-90 duration-300" />
            <span>New Work Order</span>
          </button>
        )}

        <nav className="space-y-5">
          {isManagerOrDispatcher && (
            <>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
                  Operations Command
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard size={17} className={currentTab === 'dashboard' ? 'text-sky-600' : 'text-slate-400'} />
                      <span>Dashboard</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('reports')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'reports'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 size={17} className={currentTab === 'reports' ? 'text-sky-600' : 'text-slate-400'} />
                      <span>Analytics & Reports</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
                  Management & Assets
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setCurrentTab('customers')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'customers'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 size={17} className={currentTab === 'customers' ? 'text-sky-600' : 'text-slate-400'} />
                      <span>Customers</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('sites')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'sites'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={17} className={currentTab === 'sites' ? 'text-sky-600' : 'text-slate-400'} />
                      <span>Facility Sites</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('inventory')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'inventory'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package size={17} className={currentTab === 'inventory' ? 'text-sky-600' : 'text-slate-400'} />
                      <span>Inventory Parts</span>
                    </div>
                  </button>

                  {hasRole('ADMIN') && (
                    <button
                      onClick={() => setCurrentTab('users')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentTab === 'users'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserCog size={17} className={currentTab === 'users' ? 'text-sky-600' : 'text-slate-400'} />
                        <span>User Directory</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {isTechnician && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
                Field Tasks
              </div>
              <button
                onClick={() => setCurrentTab('field')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'field'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Wrench size={17} className={currentTab === 'field' ? 'text-sky-600' : 'text-slate-400'} />
                <span>My Assigned Jobs</span>
              </button>
            </div>
          )}

          {isCustomer && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
                Customer Services
              </div>
              <button
                onClick={() => setCurrentTab('portal')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'portal'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users size={17} className={currentTab === 'portal' ? 'text-sky-600' : 'text-slate-400'} />
                <span>Support Tickets</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>KEYSTONE Enterprise</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
          <span>v2.0 RBAC Active</span>
          <span className="text-emerald-600 font-sans font-semibold">99.9% Uptime</span>
        </div>
      </div>
    </aside>
  );
};
