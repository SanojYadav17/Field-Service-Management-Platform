import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationPopover } from './NotificationPopover';
import { LogOut, Search, Sparkles, Layers } from 'lucide-react';
import { WorkOrder } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSearch: () => void;
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearch,
  onSelectWorkOrder,
}) => {
  const { user, logout, hasRole } = useAuth();

  const handleLogoClick = () => {
    if (hasRole('TECHNICIAN')) setCurrentTab('field');
    else if (hasRole('CUSTOMER')) setCurrentTab('portal');
    else setCurrentTab('dashboard');
  };

  return (
    <header className="glass-nav sticky top-0 z-30 px-6 h-14 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Tag */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
        <div className="w-9 h-9 rounded-xl ks-logo-icon-3d flex items-center justify-center text-white">
          <Layers size={19} className="drop-shadow" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-base ks-logo-3d">KEYSTONE</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 shadow-xs hidden sm:inline-flex items-center gap-1">
            <Sparkles size={10} className="text-sky-600" /> FIELD OS
          </span>
        </div>
      </div>

      {/* Global Search Shortcut & Actions */}
      {user && (
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Global Search Bar (Triggers Global Command Palette) */}
          <div
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 hover:border-sky-300 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-500 cursor-pointer transition-all w-64 justify-between shadow-2xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={14} className="text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
              <span className="truncate">Search work orders, sites...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-bold group-hover:border-sky-200">
              ⌘K
            </kbd>
          </div>

          {/* Real-Time Notification Popover */}
          <NotificationPopover
            onSelectWorkOrder={onSelectWorkOrder}
            onNavigateTab={setCurrentTab}
          />

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 bg-white pl-1.5 pr-3 py-1 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.fullName.charAt(0)}
            </div>
            <div className="text-left text-xs hidden sm:block">
              <div className="font-bold text-slate-800 leading-none">{user.fullName.replace(/\s*\([^)]*\)/g, '')}</div>
              <div className="text-sky-600 font-mono text-[9px] uppercase tracking-wider font-semibold mt-0.5">{user.role}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut size={15} />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
