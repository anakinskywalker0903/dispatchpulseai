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
  Clock,
  MapPin,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserX,
} from 'lucide-react';

interface TimelineGridProps {
  technicians: Technician[];
  requests: ServiceRequest[];
  assignments: ScheduleAssignment[];
  onSelectAssignment: (assignment: ScheduleAssignment) => void;
  onSlotClick?: (technicianId: string, timeStr: string) => void;
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
  onSlotClick,
  selectedAssignmentId,
}) => {
  const reqMap = new Map<string, ServiceRequest>(requests.map((r) => [r.id, r]));

  // Calculate workloads per technician
  const techWorkloads = new Map<string, number>();
  for (const a of assignments) {
    const dur = timeToMinutes(a.endTime) - timeToMinutes(a.startTime);
    techWorkloads.set(a.technicianId, (techWorkloads.get(a.technicianId) || 0) + dur);
  }

  const getPriorityStyle = (priority: Priority, isLocked: boolean) => {
    switch (priority) {
      case 'Emergency':
        return 'border-rose-500/80 bg-rose-950/70 text-rose-100 shadow-rose-900/40 shadow-sm ring-1 ring-rose-500/40';
      case 'High':
        return 'border-amber-500/80 bg-amber-950/70 text-amber-100 shadow-amber-900/30 shadow-sm';
      case 'Medium':
        return 'border-indigo-500/80 bg-indigo-950/70 text-indigo-100 shadow-indigo-900/30 shadow-sm';
      case 'Low':
      default:
        return 'border-slate-600 bg-slate-900/80 text-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Timeline Header (Time Scale) */}
      <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs font-semibold text-slate-400 select-none sticky top-0 z-20">
        <div className="w-72 shrink-0 px-4 py-3 border-r border-slate-800 flex items-center justify-between">
          <span className="text-slate-300 font-medium">Technicians & Roster</span>
          <span className="text-[11px] text-slate-500">Utilization</span>
        </div>
        <div className="flex-1 relative flex">
          {HOURS.map((hour, idx) => (
            <div
              key={hour}
              className={`flex-1 py-3 text-center border-r border-slate-800/60 last:border-r-0 ${
                hour === '12:00' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <span>{hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Rows */}
      <div className="flex-1 divide-y divide-slate-800/80 overflow-y-auto">
        {technicians.map((tech) => {
          const techAssignments = assignments.filter((a) => a.technicianId === tech.id);
          const workload = techWorkloads.get(tech.id) || 0;
          const capacityPercent = Math.min(100, Math.round((workload / tech.maxWorkloadMinutes) * 100));

          // Break calculations
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
              className={`flex min-h-[92px] group transition-colors ${
                isUnavailable ? 'bg-slate-950/40 opacity-70' : 'hover:bg-slate-900/30'
              }`}
            >
              {/* Technician Profile Card */}
              <div className="w-72 shrink-0 p-3.5 border-r border-slate-800 flex flex-col justify-between bg-slate-950/80">
                <div className="flex items-start gap-2.5">
                  <div className="relative">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-800"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${
                        isUnavailable
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                      title={tech.status}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {tech.name}
                      </h4>
                      <span className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 font-medium text-slate-400">
                        {tech.assignedRegion}
                      </span>
                    </div>

                    {isUnavailable ? (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-0.5">
                        <UserX className="h-3 w-3" />
                        <span>{tech.disruptionReason || 'Unavailable'}</span>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tech.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-block text-[10px] rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 px-1 py-0.2"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>
                      {formatDuration(workload)} / {formatDuration(tech.maxWorkloadMinutes)}
                    </span>
                    <span
                      className={`font-semibold ${
                        capacityPercent > 90
                          ? 'text-rose-400'
                          : capacityPercent > 75
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {capacityPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        capacityPercent > 90
                          ? 'bg-rose-500'
                          : capacityPercent > 75
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline Track */}
              <div className="flex-1 relative bg-slate-950/40 overflow-hidden">
                {/* Hour Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 border-r border-slate-800/30 last:border-r-0 h-full"
                    />
                  ))}
                </div>

                {/* Shaded Lunch Break Window */}
                {tech.breakTime && (
                  <div
                    className="absolute top-0 bottom-0 bg-slate-900/70 border-x border-slate-800 flex items-center justify-center pointer-events-none select-none z-0"
                    style={{
                      left: `${breakLeft}%`,
                      width: `${breakWidth}%`,
                    }}
                  >
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase rotate-[-90] sm:rotate-0">
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
                  const left = ((startMins - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100;
                  const width = ((endMins - startMins) / DAY_TOTAL_MINUTES) * 100;

                  const isSelected = selectedAssignmentId === asg.id;
                  const isLocked = asg.locked || asg.status === 'Completed';

                  return (
                    <div
                      key={asg.id}
                      onClick={() => onSelectAssignment(asg)}
                      className={`absolute top-2 bottom-2 rounded-lg border p-2 flex flex-col justify-between cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:z-20 z-10 select-none ${getPriorityStyle(
                        req.priority,
                        isLocked
                      )} ${
                        isSelected
                          ? 'ring-2 ring-white scale-[1.02] shadow-xl z-20'
                          : ''
                      }`}
                      style={{
                        left: `${Math.max(0, left)}%`,
                        width: `${Math.min(100 - left, Math.max(8, width))}%`,
                      }}
                      title={`${req.id}: ${req.title} (${asg.startTime}–${asg.endTime})`}
                    >
                      <div className="flex items-center justify-between gap-1 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          {req.priority === 'Emergency' && (
                            <Flame className="h-3.5 w-3.5 text-rose-400 shrink-0 animate-pulse" />
                          )}
                          <span className="text-xs font-bold truncate">
                            {req.id}
                          </span>
                          <span className="text-[10px] opacity-75 hidden sm:inline truncate">
                            • {req.customer}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isLocked ? (
                            <span
                              className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/40"
                              title="Completed & Locked (Cannot be altered)"
                            >
                              <Lock className="h-2.5 w-2.5" />
                              <span>Done</span>
                            </span>
                          ) : asg.status === 'Proposed' ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-indigo-300 bg-indigo-950/60 px-1 py-0.2 rounded border border-indigo-800/40">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>Draft</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-emerald-400">
                              Approved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] opacity-90 mt-1">
                        <p className="truncate font-medium">{req.title}</p>
                        <span className="shrink-0 font-mono ml-1 font-semibold">
                          {asg.startTime}–{asg.endTime}
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
  );
};
