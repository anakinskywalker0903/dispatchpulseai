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

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-[#ffdad6] text-[#2E2E2E] border-red-700';
      case 'High':
        return 'bg-[#fde047] text-[#2E2E2E] border-[#2E2E2E]';
      case 'Medium':
        return 'bg-[#c8e6ff] text-[#2E2E2E] border-[#2E2E2E]';
      case 'Low':
      default:
        return 'bg-white text-[#2E2E2E] border-[#2E2E2E]';
    }
  };

  return (
    <div className="neo-card bg-white overflow-hidden flex flex-col h-full">
      {/* Timeline Header (Time Scale) */}
      <div className="flex border-b-[2.5px] border-[#2E2E2E] bg-[#F1F1F1] text-xs font-black select-none sticky top-0 z-20">
        <div className="w-64 shrink-0 px-4 py-3 border-r-[2.5px] border-[#2E2E2E] flex items-center justify-between text-[#2E2E2E]">
          <span className="uppercase tracking-wider">Technicians Roster</span>
          <span className="text-[10px] font-bold text-stone-500 uppercase">Shift Capacity</span>
        </div>
        <div className="flex-1 relative flex">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className={`flex-1 py-3 text-center border-r-[1.5px] border-[#2E2E2E] last:border-r-0 font-mono text-[11px] font-bold ${
                hour === '12:00' ? 'bg-[#fef08a] text-[#2E2E2E]' : 'text-stone-700'
              }`}
            >
              <span>{hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Rows */}
      <div className="flex-1 divide-y-[2px] divide-[#2E2E2E] overflow-y-auto">
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
              className={`flex min-h-[96px] group transition-colors ${
                isUnavailable ? 'bg-[#fff5f5]' : 'hover:bg-[#FAF8F5]'
              }`}
            >
              {/* Technician Profile Card (Left) */}
              <div className="w-64 shrink-0 p-3 border-r-[2.5px] border-[#2E2E2E] flex flex-col justify-between bg-white">
                <div className="flex items-start gap-2.5">
                  <div className="relative">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="h-10 w-10 rounded-full object-cover border-[2px] border-[#2E2E2E] shadow-[1.5px_1.5px_0_0_#2E2E2E]"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-[1.5px] border-[#2E2E2E] ${
                        isUnavailable ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      title={tech.status}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-[#2E2E2E] truncate">
                        {tech.name}
                      </h4>
                      <span className="neo-badge bg-[#F1F1F1] text-[9px] py-0 px-1">
                        {tech.assignedRegion}
                      </span>
                    </div>

                    {isUnavailable ? (
                      <p className="text-[10px] text-red-600 font-black flex items-center gap-1 mt-0.5">
                        <UserX className="h-3 w-3 shrink-0" />
                        <span className="truncate">{tech.disruptionReason || 'Unavailable'}</span>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tech.skills.map((skill) => (
                          <span
                            key={skill}
                            className="neo-badge bg-[#c8e6ff] text-[#2E2E2E] text-[8px] py-0 px-1 font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-stone-600 mb-1">
                    <span>
                      {formatDuration(workload)} / {formatDuration(tech.maxWorkloadMinutes)}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        capacityPercent > 90
                          ? 'text-red-600'
                          : capacityPercent > 75
                          ? 'text-amber-700'
                          : 'text-stone-700'
                      }`}
                    >
                      {capacityPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F1F1F1] border-[1.5px] border-[#2E2E2E] rounded-xs overflow-hidden">
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

              {/* Timeline Track (Right) */}
              <div className="flex-1 relative bg-white overflow-hidden">
                {/* Vertical Hour Lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 border-r-[1px] border-stone-200 last:border-r-0 h-full"
                    />
                  ))}
                </div>

                {/* Shaded Lunch Break Box */}
                {tech.breakTime && (
                  <div
                    className="absolute top-0 bottom-0 bg-[#fef08a]/60 border-x-2 border-[#2E2E2E] flex items-center justify-center pointer-events-none select-none z-0"
                    style={{
                      left: `${breakLeft}%`,
                      width: `${breakWidth}%`,
                    }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2E2E2E]/60">
                      Lunch Break
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
                      className={`absolute top-2 bottom-2 rounded-xs border-[2px] border-[#2E2E2E] shadow-[2.5px_2.5px_0_0_#2E2E2E] p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#2E2E2E] z-10 select-none ${getPriorityStyle(
                        req.priority
                      )} ${
                        isSelected
                          ? 'ring-2 ring-black scale-[1.01] shadow-[5px_5px_0_0_#000] z-20'
                          : ''
                      }`}
                      style={{
                        left: `${Math.max(0, left)}%`,
                        width: `${Math.min(100 - left, Math.max(9, width))}%`,
                      }}
                      title={`${req.id}: ${req.title} (${asg.startTime}–${asg.endTime})`}
                    >
                      <div className="flex items-center justify-between gap-1 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          {req.priority === 'Emergency' && (
                            <Flame className="h-3 w-3 text-red-600 shrink-0 animate-pulse" />
                          )}
                          <span className="text-[11px] font-black font-mono tracking-tight text-[#2E2E2E] truncate">
                            {req.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isLocked ? (
                            <span className="neo-badge bg-[#86efac] text-[#14532d] text-[8px] py-0 px-1 font-black">
                              <Lock className="h-2 w-2" />
                              <span>Done</span>
                            </span>
                          ) : asg.status === 'Proposed' ? (
                            <span className="neo-badge bg-white text-[#2E2E2E] text-[8px] py-0 px-1 font-black">
                              <Sparkles className="h-2 w-2 text-[#FF6F20]" />
                              <span>Draft</span>
                            </span>
                          ) : (
                            <span className="neo-badge bg-[#86efac] text-[#14532d] text-[8px] py-0 px-1 font-black">
                              Confirmed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] mt-0.5">
                        <p className="truncate font-bold text-[#2E2E2E] pr-1">
                          {req.customer}
                        </p>
                        <span className="shrink-0 font-mono font-bold text-stone-700 text-[10px]">
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
