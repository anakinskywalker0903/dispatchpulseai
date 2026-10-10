'use client';

import React from 'react';
import { MockNotification } from '@/lib/types';
import { Bell, X, MessageSquare, Smartphone, Mail, CheckCircle2 } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: MockNotification[];
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const getChannelBadge = (channel: MockNotification['channel']) => {
    switch (channel) {
      case 'SMS':
        return { icon: <MessageSquare className="h-3 w-3 inline mr-1 text-emerald-700" />, label: 'SMS', color: 'bg-[#86efac] text-[#14532d]' };
      case 'Push Notification':
        return { icon: <Smartphone className="h-3 w-3 inline mr-1 text-[#FF6F20]" />, label: 'Push', color: 'bg-[#fef08a] text-[#2E2E2E]' };
      case 'Email':
      default:
        return { icon: <Mail className="h-3 w-3 inline mr-1 text-sky-700" />, label: 'Email', color: 'bg-[#c8e6ff] text-[#2E2E2E]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white border-l-[3px] border-[#2E2E2E] shadow-[-6px_0_0_0_#2E2E2E] h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b-[2.5px] border-[#2E2E2E] bg-[#FF6F20] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 neo-box-sm bg-white text-[#2E2E2E] flex items-center justify-center">
              <Bell className="h-5 w-5 text-[#FF6F20]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">
                Dispatch Notifications
              </h3>
              <p className="text-[11px] font-bold text-white/90">
                Simulated SMS & Push alerts dispatched to staff & clients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 neo-box-sm bg-white hover:bg-stone-100 text-[#2E2E2E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-xs font-bold text-stone-500">
              No notifications generated yet. Approve a schedule proposal to trigger automated alerts.
            </div>
          ) : (
            notifications.map((n) => {
              const badge = getChannelBadge(n.channel);

              return (
                <div
                  key={n.id}
                  className="neo-card-sm p-3.5 bg-white space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`neo-badge text-[9px] py-0 px-1.5 font-bold ${badge.color}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      <span className="font-black text-[#2E2E2E]">
                        {n.recipient}
                      </span>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono font-bold">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="font-black text-xs text-[#2E2E2E]">{n.subject}</p>
                  <p className="text-xs font-mono font-bold bg-[#F1F1F1] p-2 border border-[#2E2E2E] text-stone-700">
                    "{n.body}"
                  </p>

                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-800 font-black uppercase">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Delivered (Mocked)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-[2.5px] border-[#2E2E2E] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-white text-xs py-1.5 px-4 font-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
