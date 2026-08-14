import React, { useState, useEffect, useRef } from 'react';
import { WorkOrder, Part } from '../types';
import { api } from '../services/api';
import { Bell, AlertTriangle, Zap, Package, PenTool, CheckCircle2, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'sla' | 'dispatch' | 'stock' | 'signoff';
  title: string;
  message: string;
  timestamp: string;
  workOrder?: WorkOrder;
  read: boolean;
}

interface NotificationPopoverProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  onSelectWorkOrder,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const [wos, parts] = await Promise.all([
        api.getWorkOrders().catch(() => []),
        api.getParts().catch(() => []),
      ]);

      const items: NotificationItem[] = [];

      // 1. SLA Breached Alerts
      wos.filter(w => w.slaBreached).forEach(w => {
        items.push({
          id: `sla-${w.id}`,
          type: 'sla',
          title: `🚨 SLA Breached: ${w.code}`,
          message: `${w.title} has exceeded SLA resolution threshold!`,
          timestamp: w.slaDueAt ? new Date(w.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          workOrder: w,
          read: false,
        });
      });

      // 2. Unassigned Dispatch Tickets
      wos.filter(w => !w.assignedToId && w.status !== 'COMPLETED' && w.status !== 'CANCELLED').forEach(w => {
        items.push({
          id: `dispatch-${w.id}`,
          type: 'dispatch',
          title: `⚡ Pending Dispatch: ${w.code}`,
          message: `${w.title} requires technician assignment.`,
          timestamp: new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          workOrder: w,
          read: false,
        });
      });

      // 3. Low Stock Parts Alerts
      parts.filter(p => p.stockQty <= p.minStockLevel).forEach(p => {
        items.push({
          id: `stock-${p.id}`,
          type: 'stock',
          title: `📦 Low Stock Alert: ${p.name}`,
          message: `Current stock (${p.stockQty}) is below minimum reorder threshold (${p.minStockLevel}).`,
          timestamp: 'Inventory',
          read: false,
        });
      });

      // 4. Completed Sign-off Alerts
      wos.filter(w => w.customerSignature).forEach(w => {
        items.push({
          id: `signoff-${w.id}`,
          type: 'signoff',
          title: `✍️ Signed Off: ${w.code}`,
          message: `Customer ${w.signedByPerson || ''} signed off on ${w.title}.`,
          timestamp: w.signedAt ? new Date(w.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed',
          workOrder: w,
          read: false,
        });
      });

      setNotifications(items.slice(0, 10));
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setIsOpen(false);

    if (item.workOrder) {
      onSelectWorkOrder(item.workOrder);
    } else if (item.type === 'stock') {
      onNavigateTab('inventory');
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
        title="Telemetry Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white font-mono text-[9px] font-black ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card bg-white border border-slate-200 shadow-2xl rounded-2xl p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-sky-600" />
              <span className="font-extrabold text-xs text-slate-900">System Activity Telemetry</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.2 rounded-full border border-sky-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-slate-200"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 size={32} className="mx-auto text-slate-300" />
                <div>No recent system telemetry notifications</div>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-all flex items-start gap-3 ${
                    !item.read ? 'bg-sky-50/20' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'sla' && <AlertTriangle size={16} className="text-red-500" />}
                    {item.type === 'dispatch' && <Zap size={16} className="text-amber-500" />}
                    {item.type === 'stock' && <Package size={16} className="text-amber-600" />}
                    {item.type === 'signoff' && <PenTool size={16} className="text-emerald-500" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span className="truncate">{item.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.message}</p>
                  </div>

                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
