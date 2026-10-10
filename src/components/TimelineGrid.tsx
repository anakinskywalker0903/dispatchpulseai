'use client';

import React from 'react';
import {
  Technician,
  ServiceRequest,
  ScheduleAssignment,
  Priority,
} from '@/lib/types';
import { timeToMinutes, formatDuration } from '@/lib/timeUtils';
import {
  Lock,
  Flame,
  Sparkles,
  UserX,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface TimelineGridProps {
  technicians: Technician[];
  requests: ServiceRequest[];
  assignments: ScheduleAssignment[];
  onSelectAssignment: (assignment: ScheduleAssignment) => void;
  selectedAssignmentId?: string | null;
}

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];
const DAY_START_MINUTES = 8 * 60; // 480
const DAY_END_MINUTES = 18 * 60;  // 1080
const DAY_TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES; // 600

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  technicians,
  requests,
  assignments,
  onSelectAssignment,
  selectedAssignmentId,
}) => {
  const reqMap = new Map<string, ServiceRequest>(requests.map((r) => [r.id, r]));

  // Calculate workloads per technician
  const techWorkloads = new Map<string, number>();
  for (const a of assignments) {
    const dur = timeToMinutes(a.endTime) - timeToMinutes(a.startTime);
    techWorkloads.set(a.technicianId, (techWorkloads.get(a.technicianId) || 0) + dur);
  }

  const getPriorityTheme = (priority: Priority) => {
    switch (priority) {
      case 'Emergency':
        return {
          bg: 'bg-[#ffdad6]',
          border: 'border-red-700',
          badge: 'bg-red-700 text-white',
          accent: 'text-red-700',
        };
      case 'High':
        return {
          bg: 'bg-[#fde047]',
          border: 'border-[#222222]',
          badge: 'bg-[#222222] text-white',
          accent: 'text-amber-800',
        };
      case 'Medium':
        return {
          bg: 'bg-[#c8e6ff]',
          border: 'border-[#222222]',
          badge: 'bg-[#222222] text-white',
          accent: 'text-sky-800',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-white',
          border: 'border-[#222222]',
          badge: 'bg-stone-200 text-[#222222]',
          accent: 'text-stone-700',
        };
    }
  };

  return (
    <div className="bg-white border-2 border-[#222222] shadow-[4px_4px_0_0_#222222] rounded-lg overflow-hidden flex flex-col h-full">
      {/* Top Controls / Legend Bar */}
      <div className="p-3 border-b-2 border-[#222222] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="font-black uppercase tracking-wider text-[#222222]">
            Daily Dispatch Timeline
          </span>
          <span className="bg-[#222222] text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {assignments.length} Scheduled
          </span>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 border border-[#222222]" /> Emergency
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fde047] border border-[#222222]" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c8e6ff] border border-[#222222]" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-white border border-[#222222]" /> Low
          </span>
        </div>
      </div>

      {/* Scrollable Timeline Grid Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[980px]">
          {/* Header Row: Hours Scale */}
          <div className="flex border-b-2 border-[#222222] bg-[#F4F2EE] text-xs font-black select-none sticky top-0 z-20">
            {/* Left Col Header */}
            <div className="w-64 shrink-0 px-4 py-3 border-r-2 border-[#222222] flex items-center justify-between text-[#222222]">
              <span className="uppercase tracking-wider">Technician</span>
              <span className="text-[10px] font-bold text-stone-500 uppercase">Workload</span>
            </div>

            {/* Hours Headers */}
            <div className="flex-1 relative flex">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={`flex-1 py-3 text-center border-r border-stone-300 last:border-r-0 font-mono text-[11px] font-bold ${
                    hour === '12:00' ? 'bg-[#fef08a] text-[#222222] font-black' : 'text-stone-700'
                  }`}
                >
                  <span>{hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Rows */}
          <div className="divide-y-2 divide-[#222222]">
            {technicians.map((tech) => {
              const techAssignments = assignments.filter((a) => a.technicianId === tech.id);
              const workload = techWorkloads.get(tech.id) || 0;
              const capacityPercent = Math.min(100, Math.round((workload / tech.maxWorkloadMinutes) * 100));

              // Lunch break position
              const breakStartMins = tech.breakTime ? timeToMinutes(tech.breakTime.start) : null;
              const breakEndMins = tech.breakTime ? timeToMinutes(tech.breakTime.end) : null;
              const breakLeft =
                breakStartMins !== null
                  ? ((breakStartMins - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100
                  : 0;
              const breakWidth =
                breakStartMins !== null && breakEndMins !== null
                  ? ((breakEndMins - breakStartMins) / DAY_TOTAL_MINUTES) * 100
                  : 0;

              const isUnavailable = tech.status === 'Unavailable';

              return (
                <div
                  key={tech.id}
                  className={`flex min-h-[108px] transition-colors ${
                    isUnavailable ? 'bg-red-50/60' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  {/* Left Column: Technician Profile Card */}
                  <div className="w-64 shrink-0 p-3.5 border-r-2 border-[#222222] flex flex-col justify-between bg-white">
                    <div className="flex items-start gap-2.5">
                      <div className="relative shrink-0">
                        <img
                          src={tech.avatar}
                          alt={tech.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-[#222222] shadow-[2px_2px_0_0_#222222]"
                        />
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            isUnavailable ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          title={tech.status}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black uppercase text-[#222222] truncate">
                            {tech.name}
                          </h4>
                          <span className="border border-[#222222] bg-[#FAF8F5] text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                            {tech.assignedRegion}
                          </span>
                        </div>

                        {isUnavailable ? (
                          <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1">
                            <UserX className="h-3 w-3 shrink-0" />
                            <span className="truncate">{tech.disruptionReason || 'Unavailable'}</span>
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tech.skills.map((skill) => (
                              <span
                                key={skill}
                                className="bg-[#c8e6ff] text-[#222222] border border-[#222222] text-[9px] font-bold px-1 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity Meter */}
                    <div className="mt-2 pt-1 border-t border-stone-200">
                      <div className="flex items-center justify-between text-[10px] font-bold text-stone-600 mb-1">
                        <span>
                          {formatDuration(workload)} / {formatDuration(tech.maxWorkloadMinutes)}
                        </span>
                        <span
                          className={`font-mono ${
                            capacityPercent > 90
                              ? 'text-red-600 font-black'
                              : capacityPercent > 75
                              ? 'text-amber-700 font-black'
                              : 'text-stone-700'
                          }`}
                        >
                          {capacityPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#E5E3DD] border border-[#222222] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            capacityPercent > 90
                              ? 'bg-red-500'
                              : capacityPercent > 75
                              ? 'bg-amber-400'
                              : 'bg-[#FF6F20]'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Timeline Slot Track */}
                  <div className="flex-1 relative bg-white overflow-hidden">
                    {/* Hour Vertical Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="flex-1 border-r border-stone-200 last:border-r-0 h-full"
                        />
                      ))}
                    </div>

                    {/* Shaded Lunch Break Window */}
                    {tech.breakTime && (
                      <div
                        className="absolute top-0 bottom-0 bg-[#fef08a]/50 border-x-2 border-[#222222] flex items-center justify-center pointer-events-none select-none z-0"
                        style={{
                          left: `${breakLeft}%`,
                          width: `${breakWidth}%`,
                        }}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#222222]/60 bg-white/70 px-1.5 py-0.5 rounded border border-[#222222]/30">
                          Lunch
                        </span>
                      </div>
                    )}

                    {/* Assigned Job Blocks */}
                    {techAssignments.map((asg) => {
                      const req = reqMap.get(asg.requestId);
                      if (!req) return null;

                      const startMins = timeToMinutes(asg.startTime);
                      const endMins = timeToMinutes(asg.endTime);
                      const duration = endMins - startMins;
                      const left = ((startMins - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100;
                      const width = (duration / DAY_TOTAL_MINUTES) * 100;

                      const isSelected = selectedAssignmentId === asg.id;
                      const isLocked = asg.locked || asg.status === 'Completed';
                      const theme = getPriorityTheme(req.priority);

                      // Compact layout for shorter jobs (< 75 mins)
                      const isCompact = duration < 75;

                      return (
                        <div
                          key={asg.id}
                          onClick={() => onSelectAssignment(asg)}
                          className={`absolute top-2.5 bottom-2.5 rounded-md border-2 border-[#222222] shadow-[3px_3px_0_0_#222222] p-2 flex flex-col justify-between cursor-pointer transition-all duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_#222222] z-10 select-none ${theme.bg} ${
                            isSelected
                              ? 'ring-2 ring-black scale-[1.02] shadow-[6px_6px_0_0_#000] z-20'
                              : ''
                          }`}
                          style={{
                            left: `${Math.max(0, left)}%`,
                            width: `${Math.min(100 - left, Math.max(9, width))}%`,
                          }}
                          title={`${req.id}: ${req.title} (${asg.startTime}–${asg.endTime})`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-1 overflow-hidden leading-tight">
                            <div className="flex items-center gap-1 min-w-0">
                              {req.priority === 'Emergency' && (
                                <Flame className="h-3.5 w-3.5 text-red-600 shrink-0 animate-pulse" />
                              )}
                              <span className="font-mono text-xs font-black tracking-tight text-[#222222] truncate">
                                {req.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isLocked ? (
                                <span className="bg-[#86efac] text-[#14532d] border border-[#222222] text-[8px] font-black px-1 rounded flex items-center gap-0.5">
                                  <Lock className="h-2 w-2" /> Done
                                </span>
                              ) : asg.status === 'Proposed' ? (
                                <span className="bg-white text-[#222222] border border-[#222222] text-[8px] font-black px-1 rounded flex items-center gap-0.5">
                                  <Sparkles className="h-2 w-2 text-[#FF6F20]" /> Draft
                                </span>
                              ) : (
                                <span className="bg-[#86efac] text-[#14532d] border border-[#222222] text-[8px] font-black px-1 rounded">
                                  OK
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Customer / Title (shows cleanly when not super compact) */}
                          {!isCompact && (
                            <p className="text-[11px] font-bold text-[#222222] truncate leading-tight my-0.5">
                              {req.customer}
                            </p>
                          )}

                          {/* Card Footer: Time Slot */}
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-700 pt-0.5">
                            <span className="truncate">
                              {asg.startTime}–{asg.endTime}
                            </span>
                            <span className="text-[9px] opacity-75 font-sans font-bold hidden sm:inline">
                              {formatDuration(duration)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
