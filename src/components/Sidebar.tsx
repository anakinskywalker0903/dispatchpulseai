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
  MessageSquare,
  ClipboardList,
  Users,
  Activity,
} from 'lucide-react';
import { ScheduleVersion } from '@/lib/types';

export type NavTab = 'TIMELINE' | 'CHATBOT' | 'REQUESTS' | 'TECHNICIANS' | 'TELEMETRY';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentVersion: ScheduleVersion | null;
  versionCount: number;
  auditCount: number;
  notificationCount: number;
  unassignedCount: number;
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
  currentTab,
  onSelectTab,
  currentVersion,
  versionCount,
  auditCount,
  notificationCount,
  unassignedCount,
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
    <aside className="w-64 shrink-0 bg-[#FF6F20] border-r-[3px] border-[#222222] shadow-[4px_0_0_0_#222222] flex flex-col justify-between p-4 z-40 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Top Brand Section */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-3 border-b-2 border-[#222222]">
          <div className="h-11 w-11 rounded-full bg-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] flex items-center justify-center shrink-0">
            <Wrench className="h-6 w-6 text-[#222222]" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight text-[#222222] leading-tight">
              DispatchPulse
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#222222]/80">
              Field Service AI
            </p>
          </div>
        </div>

        {/* Big Action: Run AI Agent */}
        <button
          onClick={onTriggerAIPlanning}
          disabled={isPlanning}
          className="w-full bg-white text-[#222222] border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-md py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#222222] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_#222222] transition-all cursor-pointer disabled:opacity-60"
        >
          <Sparkles className={`h-4 w-4 text-[#FF6F20] ${isPlanning ? 'animate-spin' : ''}`} />
          <span>{isPlanning ? 'Agent Solving...' : 'Run Dispatch AI'}</span>
        </button>

        {/* Navigation / Tabs List */}
        <nav className="space-y-1.5 pt-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#222222]/70 px-2 pb-1">
            Command Modules
          </div>

          <button
            onClick={() => onSelectTab('TIMELINE')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs border-2 border-[#222222] transition-all cursor-pointer ${
              currentTab === 'TIMELINE'
                ? 'bg-[#222222] text-white shadow-[2px_2px_0_0_#222222]'
                : 'bg-white text-[#222222] shadow-[2px_2px_0_0_#222222] hover:translate-x-[-1px] hover:translate-y-[-1px]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4" />
              <span>Gantt Timeline</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('CHATBOT')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs border-2 border-[#222222] transition-all cursor-pointer ${
              currentTab === 'CHATBOT'
                ? 'bg-[#222222] text-white shadow-[2px_2px_0_0_#222222]'
                : 'bg-white text-[#222222] shadow-[2px_2px_0_0_#222222] hover:translate-x-[-1px] hover:translate-y-[-1px]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-[#FF6F20]" />
              <span>AI Copilot Chat</span>
            </div>
            <span className="text-[9px] bg-[#fef08a] text-[#222222] font-black px-1.5 py-0.2 rounded border border-[#222222]">
              Live
            </span>
          </button>

          <button
            onClick={() => onSelectTab('REQUESTS')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs border-2 border-[#222222] transition-all cursor-pointer ${
              currentTab === 'REQUESTS'
                ? 'bg-[#222222] text-white shadow-[2px_2px_0_0_#222222]'
                : 'bg-white text-[#222222] shadow-[2px_2px_0_0_#222222] hover:translate-x-[-1px] hover:translate-y-[-1px]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="h-4 w-4" />
              <span>Work Orders (CRUD)</span>
            </div>
            {unassignedCount > 0 && (
              <span className="text-[9px] bg-[#ffdad6] text-red-900 font-bold px-1.5 py-0.2 rounded border border-red-700">
                {unassignedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('TECHNICIANS')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs border-2 border-[#222222] transition-all cursor-pointer ${
              currentTab === 'TECHNICIANS'
                ? 'bg-[#222222] text-white shadow-[2px_2px_0_0_#222222]'
                : 'bg-white text-[#222222] shadow-[2px_2px_0_0_#222222] hover:translate-x-[-1px] hover:translate-y-[-1px]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4" />
              <span>Staff Roster</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('TELEMETRY')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs border-2 border-[#222222] transition-all cursor-pointer ${
              currentTab === 'TELEMETRY'
                ? 'bg-[#222222] text-white shadow-[2px_2px_0_0_#222222]'
                : 'bg-white text-[#222222] shadow-[2px_2px_0_0_#222222] hover:translate-x-[-1px] hover:translate-y-[-1px]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4" />
              <span>AI Telemetry</span>
            </div>
          </button>

          <div className="text-[10px] font-black uppercase tracking-wider text-[#222222]/70 px-2 pt-2.5 pb-1">
            Disruptions Simulator
          </div>

          <button
            onClick={onSimulateEmergency}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs text-[#222222] bg-[#ffdad6] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-600 animate-pulse" />
              <span>+ Emergency Job</span>
            </div>
            <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.2 rounded">
              SR-999
            </span>
          </button>

          <button
            onClick={onSimulateDisruption}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md font-black uppercase text-xs text-[#222222] bg-[#fef08a] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span>Tech Breakdown</span>
            </div>
            <span className="text-[10px] bg-amber-500 text-[#222222] font-bold px-1.5 py-0.2 rounded">
              Marcus
            </span>
          </button>

          <div className="text-[10px] font-black uppercase tracking-wider text-[#222222]/70 px-2 pt-2.5 pb-1">
            Audit & Settings
          </div>

          <button
            onClick={onOpenVersions}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md font-black uppercase text-xs text-[#222222] bg-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              <span>Versions</span>
            </div>
            <span className="bg-[#c8e6ff] text-[#222222] border border-[#222222] font-mono font-bold text-[9px] py-0 px-1 rounded">
              v{currentVersion?.versionNumber || 1}
            </span>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md font-black uppercase text-xs text-[#222222] bg-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              <span>Audit Trail</span>
            </div>
            {auditCount > 0 && (
              <span className="bg-[#fde047] text-[#222222] border border-[#222222] font-mono font-bold text-[9px] py-0 px-1 rounded">
                {auditCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNotifications}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md font-black uppercase text-xs text-[#222222] bg-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" />
              <span>Notifications</span>
            </div>
            {notificationCount > 0 && (
              <span className="bg-[#86efac] text-[#14532d] border border-[#222222] font-mono font-bold text-[9px] py-0 px-1 rounded">
                {notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md font-black uppercase text-xs text-[#222222] bg-white border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Key className="h-3.5 w-3.5 text-[#FF6F20]" />
              <span>API Key</span>
            </div>
            <span className="text-[9px] font-bold text-stone-500">Groq</span>
          </button>
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-2 pt-3 border-t-2 border-[#222222] pb-1">
        <button
          onClick={onReset}
          className="w-full bg-white text-[#222222] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] rounded-md py-1.5 px-2 text-[11px] font-black uppercase flex items-center justify-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Shift</span>
        </button>

        {/* Live Engine Status Card */}
        <div className="bg-[#222222] text-white p-2 rounded-md border-2 border-[#222222] shadow-[2px_2px_0_0_#000] text-center space-y-0.5">
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
