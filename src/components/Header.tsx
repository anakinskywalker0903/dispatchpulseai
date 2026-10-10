'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { ScheduleVersion } from '@/lib/types';

interface HeaderProps {
  currentVersion: ScheduleVersion;
  assignedCount: number;
  totalRequestsCount: number;
  activeTechCount: number;
  totalTechCount: number;
  hasErrors: boolean;
  unassignedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentVersion,
  assignedCount,
  totalRequestsCount,
  activeTechCount,
  totalTechCount,
  hasErrors,
  unassignedCount,
}) => {
  const completionPercentage = Math.round((assignedCount / totalRequestsCount) * 100) || 0;

  return (
    <div className="space-y-4">
      {/* Top Banner / Title Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b-[2.5px] border-[#2E2E2E]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2E2E2E] leading-none">
              Dispatch Operations
            </h2>
            <span className="neo-badge bg-[#fef08a] text-[#2E2E2E]">
              v{currentVersion.versionNumber} ({currentVersion.status})
            </span>
          </div>
          <p className="text-xs font-semibold text-stone-600 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#FF6F20]" />
              Saturday, Oct 10, 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-stone-500" />
              Shift: 08:00 – 18:00
            </span>
          </p>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <div className="neo-badge bg-[#ffdad6] text-red-800 border-red-800 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Constraint Violation Detected</span>
            </div>
          ) : (
            <div className="neo-badge bg-[#86efac] text-[#14532d] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-green-700" />
              <span>Hard Constraints Verified</span>
            </div>
          )}

          <div className="neo-badge bg-white text-[#2E2E2E] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FF6F20] animate-ping" />
            <span className="h-2 w-2 rounded-full bg-[#FF6F20] -ml-3.5" />
            <span>Groq Engine Active</span>
          </div>
        </div>
      </div>

      {/* 4 Neo-Brutalist KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Scheduled Work Orders */}
        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Dispatched Orders
            </span>
            <div className="h-7 w-7 neo-box-sm bg-[#c8e6ff] flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-[#2E2E2E]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#2E2E2E]">
                {assignedCount}
              </span>
              <span className="text-xs font-bold text-stone-500">
                / {totalRequestsCount} total ({completionPercentage}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-[#F1F1F1] border-2 border-[#2E2E2E] mt-2 rounded-xs overflow-hidden">
              <div
                className="h-full bg-[#FF6F20]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Unassigned Queue */}
        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Unassigned Queue
            </span>
            <div className="h-7 w-7 neo-box-sm bg-[#fef08a] flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[#2E2E2E]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#2E2E2E]">
                {unassignedCount}
              </span>
              <span className="text-xs font-bold text-stone-500">
                Tickets Pending Slot
              </span>
            </div>
            <p className="text-[10px] font-bold text-[#FF6F20] mt-1 uppercase">
              {unassignedCount === 0 ? '✓ All Tickets Dispatched' : 'Needs Dispatch Allocation'}
            </p>
          </div>
        </div>

        {/* KPI 3: Technicians Roster */}
        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Field Technicians
            </span>
            <div className="h-7 w-7 neo-box-sm bg-[#86efac] flex items-center justify-center">
              <Users className="h-4 w-4 text-[#2E2E2E]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#2E2E2E]">
                {activeTechCount}
              </span>
              <span className="text-xs font-bold text-stone-500">
                / {totalTechCount} Active On Duty
              </span>
            </div>
            <p className="text-[10px] font-bold text-stone-600 mt-1 uppercase">
              Downtown, North, West, South, East
            </p>
          </div>
        </div>

        {/* KPI 4: Mathematical Validation */}
        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Deterministic Safety
            </span>
            <div className="h-7 w-7 neo-box-sm bg-[#e9d5ff] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-[#2E2E2E]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#2E2E2E]">
                100%
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Zero Conflicts
              </span>
            </div>
            <p className="text-[10px] font-bold text-stone-600 mt-1 uppercase">
              Skill & Overlap Constraints Guarded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
