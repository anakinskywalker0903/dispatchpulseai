'use client';

import React from 'react';
import {
  Calendar,
  Sparkles,
  Flame,
  AlertTriangle,
  History,
  FileText,
  Bell,
  Key,
  RotateCcw,
  Wrench,
  Radio,
} from 'lucide-react';
import { ScheduleVersion } from '@/lib/types';

interface SidebarProps {
  currentVersion: ScheduleVersion | null;
  versionCount: number;
  auditCount: number;
  notificationCount: number;
  isPlanning: boolean;
  onTriggerAIPlanning: () => void;
  onSimulateEmergency: () => void;
  onSimulateDisruption: () => void;
  onOpenVersions: () => void;
  onOpenAuditLogs: () => void;
  onOpenNotifications: () => void;
  onOpenApiKeyModal: () => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentVersion,
  versionCount,
  auditCount,
  notificationCount,
  isPlanning,
  onTriggerAIPlanning,
  onSimulateEmergency,
  onSimulateDisruption,
  onOpenVersions,
  onOpenAuditLogs,
  onOpenNotifications,
  onOpenApiKeyModal,
  onReset,
}) => {
  return (
    <aside className="w-64 shrink-0 bg-[#FF6F20] border-r-[3px] border-[#2E2E2E] shadow-[4px_0_0_0_#2E2E2E] flex flex-col justify-between p-4 z-40 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Top Brand Section */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-3 border-b-[2.5px] border-[#2E2E2E]">
          <div className="h-11 w-11 rounded-full bg-white border-[2.5px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] flex items-center justify-center shrink-0">
            <Wrench className="h-6 w-6 text-[#2E2E2E]" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight text-[#2E2E2E] leading-tight">
              DispatchPulse
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#2E2E2E]/80">
              Field Service AI
            </p>
          </div>
        </div>

        {/* Big Action: Run AI Agent */}
        <button
          onClick={onTriggerAIPlanning}
          disabled={isPlanning}
          className="w-full neo-btn neo-btn-white py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-black tracking-wide"
        >
          <Sparkles className={`h-4 w-4 text-[#FF6F20] ${isPlanning ? 'animate-spin' : ''}`} />
          <span>{isPlanning ? 'Agent Solving...' : 'Run Dispatch AI'}</span>
        </button>

        {/* Navigation / Actions List */}
        <nav className="space-y-1.5 pt-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#2E2E2E]/70 px-2 pb-1">
            Command Center
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-white border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <Calendar className="h-4 w-4" />
            <span>Today's Timeline</span>
          </button>

          <button
            onClick={onSimulateEmergency}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-[#ffdad6] border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-600 animate-pulse" />
              <span>+ Emergency Job</span>
            </div>
            <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-xs">
              SR-999
            </span>
          </button>

          <button
            onClick={onSimulateDisruption}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-[#fef08a] border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span>Tech Breakdown</span>
            </div>
            <span className="text-[10px] bg-amber-500 text-[#2E2E2E] font-bold px-1.5 py-0.2 rounded-xs">
              Marcus
            </span>
          </button>

          <div className="text-[10px] font-black uppercase tracking-wider text-[#2E2E2E]/70 px-2 pt-3 pb-1">
            Auditing & Telemetry
          </div>

          <button
            onClick={onOpenVersions}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-white border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Version History</span>
            </div>
            <span className="neo-badge bg-[#c8e6ff] text-[#2E2E2E] text-[10px] py-0 px-1.5">
              v{currentVersion?.versionNumber || 1}
            </span>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-white border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Audit Trail</span>
            </div>
            {auditCount > 0 && (
              <span className="neo-badge bg-[#fde047] text-[#2E2E2E] text-[10px] py-0 px-1.5">
                {auditCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNotifications}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-white border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </div>
            {notificationCount > 0 && (
              <span className="neo-badge bg-[#86efac] text-[#2E2E2E] text-[10px] py-0 px-1.5">
                {notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-black uppercase text-xs text-[#2E2E2E] bg-white border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#2E2E2E] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[#FF6F20]" />
              <span>API Key / Engine</span>
            </div>
            <span className="text-[10px] font-bold text-stone-500">Groq</span>
          </button>
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-3 pt-4 border-t-[2.5px] border-[#2E2E2E]">
        <button
          onClick={onReset}
          className="w-full neo-btn neo-btn-white py-1.5 px-2 text-[11px] font-black flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Shift</span>
        </button>

        {/* Live Engine Status Card */}
        <div className="bg-[#2E2E2E] text-white p-2.5 rounded-xs border-[2px] border-[#2E2E2E] shadow-[2px_2px_0_0_#000] text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#86efac]">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>AI System Online</span>
          </div>
          <p className="text-[9px] font-mono text-stone-300">
            Groq LLaMA 3.3 70B
          </p>
        </div>
      </div>
    </aside>
  );
};
