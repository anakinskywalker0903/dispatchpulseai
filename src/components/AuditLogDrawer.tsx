'use client';

import React, { useState } from 'react';
import { AuditLogEntry } from '@/lib/types';
import {
  FileText,
  X,
  Bot,
  User,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Flame,
  Bell,
  Search,
} from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AuditLogEntry[];
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = entries.filter(
    (e) =>
      e.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActorBadge = (actor: AuditLogEntry['actor']) => {
    switch (actor) {
      case 'AI_AGENT':
        return {
          icon: <Bot className="h-3.5 w-3.5 text-indigo-400" />,
          label: 'AI Agent (Groq)',
          color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
        };
      case 'DISPATCHER':
        return {
          icon: <User className="h-3.5 w-3.5 text-emerald-400" />,
          label: 'Dispatcher (Human)',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'SYSTEM':
      default:
        return {
          icon: <Cpu className="h-3.5 w-3.5 text-slate-400" />,
          label: 'System Engine',
          color: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Immutable System & Decision Audit Log
              </h3>
              <p className="text-xs text-slate-400">
                {entries.length} recorded events • Compliance & override trail
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

        {/* Filter Input */}
        <div className="p-3 border-b border-slate-800 bg-slate-950">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit events by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center p-8 text-xs text-slate-500">
              No audit logs match your search.
            </div>
          ) : (
            filtered.map((entry) => {
              const badge = getActorBadge(entry.actor);

              return (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-1.5 text-xs transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${badge.color}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-slate-400 font-mono">
                        {entry.eventType}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-slate-200 font-medium leading-relaxed">
                    {entry.summary}
                  </p>

                  {entry.details && (
                    <div className="bg-slate-950/80 rounded p-2 border border-slate-900 text-[11px] text-slate-400 font-mono overflow-x-auto">
                      {typeof entry.details === 'string'
                        ? entry.details
                        : JSON.stringify(entry.details, null, 2)}
                    </div>
                  )}
                </div>
              );
            })
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
