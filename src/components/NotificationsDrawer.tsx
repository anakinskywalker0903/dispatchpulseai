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

  const getChannelIcon = (channel: MockNotification['channel']) => {
    switch (channel) {
      case 'SMS':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case 'Push Notification':
        return <Smartphone className="h-3.5 w-3.5 text-indigo-400" />;
      case 'Email':
      default:
        return <Mail className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Mocked Dispatch Notifications
              </h3>
              <p className="text-xs text-slate-400">
                Simulated SMS & Push alerts dispatched to field staff & clients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-xs text-slate-500">
              No notifications generated yet. Approve a schedule proposal to trigger automated alerts.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getChannelIcon(n.channel)}
                    <span className="font-semibold text-slate-200">
                      {n.recipient}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({n.recipientRole})
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">{n.subject}</p>
                <p className="text-xs text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-900 italic">
                  "{n.body}"
                </p>

                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Delivered (Simulated)</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
