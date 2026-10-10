'use client';

import React, { useState } from 'react';
import { AuditLogEntry } from '@/lib/types';
import {
  FileText,
  X,
  Bot,
  User,
  Cpu,
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
          icon: <Bot className="h-3.5 w-3.5 text-[#FF6F20]" />,
          label: 'AI Agent (Groq)',
          color: 'bg-[#c8e6ff] text-[#2E2E2E]',
        };
      case 'DISPATCHER':
        return {
          icon: <User className="h-3.5 w-3.5 text-emerald-700" />,
          label: 'Dispatcher (Human)',
          color: 'bg-[#86efac] text-[#14532d]',
        };
      case 'SYSTEM':
      default:
        return {
          icon: <Cpu className="h-3.5 w-3.5 text-stone-700" />,
          label: 'System Engine',
          color: 'bg-[#F1F1F1] text-stone-700',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-white border-l-[3px] border-[#2E2E2E] shadow-[-6px_0_0_0_#2E2E2E] h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b-[2.5px] border-[#2E2E2E] bg-[#FF6F20] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 neo-box-sm bg-white text-[#2E2E2E] flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#FF6F20]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">
                Immutable Decision Audit Trail
              </h3>
              <p className="text-[11px] font-bold text-white/90">
                {entries.length} recorded events • Dispatcher overrides & AI plans
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

        {/* Filter Input */}
        <div className="p-3 border-b-[2px] border-[#2E2E2E] bg-[#F1F1F1]">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full neo-card-sm pl-9 pr-3 py-1.5 text-xs font-bold bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#FAF8F5]">
          {filtered.length === 0 ? (
            <div className="text-center p-8 text-xs font-bold text-stone-500">
              No audit logs match your search.
            </div>
          ) : (
            filtered.map((entry) => {
              const badge = getActorBadge(entry.actor);

              return (
                <div
                  key={entry.id}
                  className="neo-card-sm p-3 bg-white space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`neo-badge text-[10px] py-0 px-1.5 font-bold ${badge.color}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                      <span className="neo-badge bg-[#F1F1F1] text-[9px] py-0 px-1 text-stone-600 font-mono">
                        {entry.eventType}
                      </span>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono font-bold">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-[#2E2E2E] font-black leading-snug">
                    {entry.summary}
                  </p>

                  {entry.details && (
                    <div className="bg-[#F1F1F1] rounded-xs p-2 border border-[#2E2E2E] text-[10px] text-stone-700 font-mono overflow-x-auto">
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
