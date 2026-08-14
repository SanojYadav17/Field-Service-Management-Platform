import React from 'react';
import { KeyRound, ShieldCheck, Sparkles, Activity, FileText, HelpCircle, ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';

interface FooterProps {
  variant?: 'app' | 'landing';
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ variant = 'app', onNavigateTab }) => {
  // 1. MINIMALIST & CLEAN SAAS APP FOOTER (For Authenticated App Dashboard)
  if (variant === 'app') {
    return (
      <footer className="mt-8 pt-4 pb-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center font-black text-[10px]">
            K
          </div>
          <span className="font-bold text-slate-700">KEYSTONE Field OS v2.4</span>
          <span className="text-slate-300">•</span>
          <span>Enterprise Field Service Intelligence</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Neon DB Connected • Telemetry Live (99.99% Uptime)</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>© 2026 KEYSTONE Enterprise</span>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateTab?.('dashboard'); }} className="hover:text-sky-600 transition-colors">
            Support
          </a>
        </div>
      </footer>
    );
  }

  // 2. RICH MARKETING LANDING PAGE FOOTER (For Landing & Login Page)
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-12 px-6 lg:px-12 mt-16">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl ks-logo-icon-3d flex items-center justify-center text-white font-black">
                <Layers size={16} className="drop-shadow" />
              </div>
              <span className="font-black text-base tracking-wider text-white">KEYSTONE</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 flex items-center gap-1">
                <Sparkles size={9} /> FIELD OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enterprise Field Service Automation, Live GPS Dispatch, SLA Compliance Engine & Inventory Intelligence Platform.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-xl w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Telemetry Connected • 99.99% Uptime</span>
            </div>
          </div>

          {/* Core Modules Column */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">Field OS Modules</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => onNavigateTab?.('dashboard')} className="hover:text-sky-400 transition-colors flex items-center gap-1 text-left cursor-pointer">
                  Operations Dashboard <ArrowUpRight size={10} />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab?.('field')} className="hover:text-sky-400 transition-colors flex items-center gap-1 text-left cursor-pointer">
                  Technician Field Workspace <ArrowUpRight size={10} />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab?.('portal')} className="hover:text-sky-400 transition-colors flex items-center gap-1 text-left cursor-pointer">
                  Customer Service Portal <ArrowUpRight size={10} />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab?.('inventory')} className="hover:text-sky-400 transition-colors flex items-center gap-1 text-left cursor-pointer">
                  Parts & Inventory Analytics <ArrowUpRight size={10} />
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Security */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">Security & Governance</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-sky-400 shrink-0" />
                <span>Multi-Role RBAC Authorization</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Activity size={13} className="text-emerald-400 shrink-0" />
                <span>Live GPS Check-in & Sign-offs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-400 shrink-0" />
                <span>Automated SLA Breach Tracking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HelpCircle size={13} className="text-amber-400 shrink-0" />
                <span>Neon SSL DB Pool Encryption</span>
              </li>
            </ul>
          </div>

          {/* Quick SLA & Support */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">Enterprise Support</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Have questions or need custom integrations? Contact your Field Operations Administrator.
            </p>
            <div className="pt-1">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                Support: admin@meridian.com
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>© 2026 KEYSTONE Enterprise Field Service Systems.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">System Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
