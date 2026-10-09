'use client';

import React from 'react';
import { ServiceRequest, ScheduleAssignment, Technician } from '@/lib/types';
import { formatDuration } from '@/lib/timeUtils';
import {
  X,
  Wrench,
  MapPin,
  Clock,
  AlertTriangle,
  Lock,
  Calendar,
  Flame,
  UserCheck,
} from 'lucide-react';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  assignment?: ScheduleAssignment | null;
  technician?: Technician | null;
  onEditAssignment?: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  assignment,
  technician,
  onEditAssignment,
}) => {
  if (!isOpen || !request) return null;

  const isLocked = assignment?.locked || assignment?.status === 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900">
              {request.id}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                request.priority === 'Emergency'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : request.priority === 'High'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
              }`}
            >
              {request.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Title & Customer */}
        <div>
          <h3 className="text-base font-bold text-white">{request.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer: <strong className="text-slate-200">{request.customer}</strong> • {request.address}
          </p>
        </div>

        {/* Description */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 text-xs text-slate-300 leading-relaxed">
          {request.description}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 p-2.5">
            <span className="text-[11px] text-slate-500 block">Required Skill</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
              <Wrench className="h-3.5 w-3.5 text-indigo-400" />
              {request.requiredSkill}
            </span>
          </div>

          <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 p-2.5">
            <span className="text-[11px] text-slate-500 block">Region</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {request.region}
            </span>
          </div>

          <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 p-2.5">
            <span className="text-[11px] text-slate-500 block">Estimated Duration</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {formatDuration(request.estimatedDuration)}
            </span>
          </div>

          <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 p-2.5">
            <span className="text-[11px] text-slate-500 block">Preferred Window</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {request.preferredTimeWindow
                ? `${request.preferredTimeWindow.start} – ${request.preferredTimeWindow.end}`
                : 'Anytime during shift'}
            </span>
          </div>
        </div>

        {/* Current Assignment Status */}
        {assignment && technician ? (
          <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-300">
                Assigned to {technician.name}
              </span>
              <span className="font-mono text-slate-300 font-semibold">
                {assignment.startTime} – {assignment.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Status: <strong className="text-white">{assignment.status}</strong></span>
              {isLocked && (
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            {assignment.overrideReason && (
              <p className="text-[11px] text-amber-300 italic pt-1">
                Note: {assignment.overrideReason}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-400">
            Currently Unassigned in dispatch queue.
          </div>
        )}

        {/* Missing Info Warning */}
        {request.missingInfoFlags && request.missingInfoFlags.length > 0 && (
          <div className="rounded-lg bg-amber-950/30 border border-amber-900/50 p-2.5 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Missing Ticket Information:</span>
              <p className="text-[11px] text-amber-200/90 mt-0.5">
                {request.missingInfoFlags.join('; ')}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>

          {onEditAssignment && !isLocked && (
            <button
              onClick={() => {
                onClose();
                onEditAssignment();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>{assignment ? 'Modify Assignment' : 'Assign to Technician'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
