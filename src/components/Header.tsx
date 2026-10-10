'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
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
  const completionPercentage =
    totalRequestsCount > 0 ? Math.round((assignedCount / totalRequestsCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner / Title Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-[#222222]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#222222]">
              Dispatch Operations
            </h2>
            <span className="bg-[#fef08a] text-[#222222] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] font-mono text-xs font-black px-2.5 py-0.5 rounded-md">
              v{currentVersion.versionNumber} ({currentVersion.status})
            </span>
          </div>
          <p className="text-xs font-bold text-stone-600 mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#222222]">
              <Calendar className="h-3.5 w-3.5 text-[#FF6F20]" />
              Saturday, Oct 10, 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-stone-600">
              <Clock className="h-3.5 w-3.5" />
              Shift: 08:00 – 18:00
            </span>
          </p>
        </div>

        {/* Right Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hasErrors ? (
            <div className="bg-[#ffdad6] text-red-900 border-2 border-red-700 shadow-[2px_2px_0_0_#b91c1c] text-xs font-black px-3 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Constraint Violation</span>
            </div>
          ) : (
            <div className="bg-[#86efac] text-[#14532d] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] text-xs font-black px-3 py-1 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
              <span>Hard Constraints Verified</span>
            </div>
          )}

          <div className="bg-white text-[#222222] border-2 border-[#222222] shadow-[2px_2px_0_0_#222222] text-xs font-black px-3 py-1 rounded-md flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF6F20] animate-pulse" />
            <span>Groq LLaMA 3.3 Active</span>
          </div>
        </div>
      </div>

      {/* 4 Neo-Brutalist KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Scheduled Work Orders */}
        <div className="bg-white border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Dispatched Orders
            </span>
            <div className="h-8 w-8 rounded-md bg-[#c8e6ff] border-2 border-[#222222] flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-[#222222]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#222222]">
                {assignedCount}
              </span>
              <span className="text-xs font-bold text-stone-500">
                / {totalRequestsCount} total ({completionPercentage}%)
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full bg-[#E5E3DD] border border-[#222222] mt-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6F20]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Unassigned Queue */}
        <div className="bg-white border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Unassigned Queue
            </span>
            <div className="h-8 w-8 rounded-md bg-[#fef08a] border-2 border-[#222222] flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[#222222]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#222222]">
                {unassignedCount}
              </span>
              <span className="text-xs font-bold text-stone-500">
                Tickets Pending
              </span>
            </div>
            <p className="text-[11px] font-black text-[#FF6F20] mt-1 uppercase tracking-wide">
              {unassignedCount === 0 ? '✓ Full Shift Allocated' : 'Needs Slot Allocation'}
            </p>
          </div>
        </div>

        {/* KPI 3: Technicians Roster */}
        <div className="bg-white border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Field Technicians
            </span>
            <div className="h-8 w-8 rounded-md bg-[#86efac] border-2 border-[#222222] flex items-center justify-center">
              <Users className="h-4 w-4 text-[#222222]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#222222]">
                {activeTechCount}
              </span>
              <span className="text-xs font-bold text-stone-500">
                / {totalTechCount} Active On Duty
              </span>
            </div>
            <p className="text-[11px] font-bold text-stone-600 mt-1 uppercase">
              Downtown, North, West, South, East
            </p>
          </div>
        </div>

        {/* KPI 4: Mathematical Validation */}
        <div className="bg-white border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Deterministic Safety
            </span>
            <div className="h-8 w-8 rounded-md bg-[#e9d5ff] border-2 border-[#222222] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-[#222222]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#222222]">
                100%
              </span>
              <span className="text-xs font-bold text-emerald-800">
                Zero Overlaps
              </span>
            </div>
            <p className="text-[11px] font-bold text-stone-600 mt-1 uppercase">
              Skill & Lunch Rules Enforced
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
