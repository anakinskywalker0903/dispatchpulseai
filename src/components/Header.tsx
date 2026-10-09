'use client';

import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  RotateCcw,
  History,
  FileText,
  Bell,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
} from 'lucide-react';
import { ScheduleVersion } from '@/lib/types';

interface HeaderProps {
  currentVersion: ScheduleVersion;
  allVersions: ScheduleVersion[];
  assignedCount: number;
  totalRequestsCount: number;
  activeTechCount: number;
  hasErrors: boolean;
  onTriggerAIPlanning: () => void;
  onSimulateDisruption: () => void;
  onSimulateEmergency: () => void;
  onReset: () => void;
  onOpenVersionHistory: () => void;
  onOpenAuditLogs: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  auditCount: number;
  isPlanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentVersion,
  allVersions,
  assignedCount,
  totalRequestsCount,
  activeTechCount,
  hasErrors,
  onTriggerAIPlanning,
  onSimulateDisruption,
  onSimulateEmergency,
  onReset,
  onOpenVersionHistory,
  onOpenAuditLogs,
  onOpenNotifications,
  notificationCount,
  auditCount,
  isPlanning,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Brand & Shift Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                DispatchPulse <span className="text-indigo-400 font-semibold text-sm">AI</span>
              </h1>
              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                v{currentVersion.versionNumber} ({currentVersion.status})
              </span>
              {hasErrors && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/80 px-2 py-0.5 text-xs font-semibold text-rose-300 border border-rose-800 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> Constraint Violation
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-500" /> Oct 9, 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" /> Shift: 08:00 – 18:00
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-slate-500" /> {activeTechCount} Active Techs
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {assignedCount}/{totalRequestsCount} Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Disruption Simulator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Disruption Simulator Actions */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800">
            <button
              onClick={onSimulateEmergency}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition-colors"
              title="Simulate ICU Generator Emergency (SR-999)"
            >
              <Flame className="h-3.5 w-3.5 text-rose-400" />
              <span>+ Emergency</span>
            </button>
            <button
              onClick={onSimulateDisruption}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-amber-300 hover:bg-amber-950/60 hover:text-amber-200 transition-colors"
              title="Simulate Tech Van Breakdown / Illness"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Tech Breakdown</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Reset day to initial state"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* AI Plan Trigger */}
          <button
            onClick={onTriggerAIPlanning}
            disabled={isPlanning}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${isPlanning ? 'animate-spin' : ''}`} />
            <span>{isPlanning ? 'Agent Planning...' : 'Run DispatchAI'}</span>
          </button>

          {/* Drawer / Modal Toggles */}
          <button
            onClick={onOpenVersionHistory}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span>Versions ({allVersions.length})</span>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors relative"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Audit Log</span>
            {auditCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] font-bold text-slate-300">
                {auditCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors relative"
          >
            <Bell className="h-3.5 w-3.5 text-slate-400" />
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
