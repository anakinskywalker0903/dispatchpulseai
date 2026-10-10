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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg neo-card p-6 bg-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#2E2E2E] pb-3">
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-[#c8e6ff] text-[10px] font-mono">
              {request.id}
            </span>
            <span
              className={`neo-badge text-[10px] ${
                request.priority === 'Emergency'
                  ? 'bg-[#ffdad6] text-red-900 border-red-700 animate-pulse'
                  : request.priority === 'High'
                  ? 'bg-[#fde047] text-[#2E2E2E]'
                  : 'bg-[#c8e6ff] text-[#2E2E2E]'
              }`}
            >
              {request.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 neo-box-sm bg-white hover:bg-[#F1F1F1] text-[#2E2E2E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title & Customer */}
        <div>
          <h3 className="text-base font-black text-[#2E2E2E]">{request.title}</h3>
          <p className="text-xs font-bold text-stone-500 mt-0.5">
            Customer: <strong className="text-[#2E2E2E]">{request.customer}</strong> • {request.address}
          </p>
        </div>

        {/* Description */}
        <div className="neo-card-sm p-3 bg-[#FAF8F5] text-xs font-medium text-stone-700 leading-relaxed">
          {request.description}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="neo-card-sm p-2.5 bg-white">
            <span className="text-[10px] font-black uppercase text-stone-500 block">Required Skill</span>
            <span className="font-bold text-[#2E2E2E] flex items-center gap-1 mt-0.5">
              <Wrench className="h-3.5 w-3.5 text-[#FF6F20]" />
              {request.requiredSkill}
            </span>
          </div>

          <div className="neo-card-sm p-2.5 bg-white">
            <span className="text-[10px] font-black uppercase text-stone-500 block">Assigned Region</span>
            <span className="font-bold text-[#2E2E2E] flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-stone-500" />
              {request.region}
            </span>
          </div>

          <div className="neo-card-sm p-2.5 bg-white">
            <span className="text-[10px] font-black uppercase text-stone-500 block">Estimated Duration</span>
            <span className="font-bold text-[#2E2E2E] flex items-center gap-1 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-stone-500" />
              {formatDuration(request.estimatedDuration)}
            </span>
          </div>

          <div className="neo-card-sm p-2.5 bg-white">
            <span className="text-[10px] font-black uppercase text-stone-500 block">Preferred Window</span>
            <span className="font-bold text-[#2E2E2E] mt-0.5 block">
              {request.preferredTimeWindow
                ? `${request.preferredTimeWindow.start} – ${request.preferredTimeWindow.end}`
                : 'Flexible throughout shift'}
            </span>
          </div>
        </div>

        {/* Current Assignment Status */}
        {assignment && technician ? (
          <div className="neo-card-sm p-3 bg-[#c8e6ff] text-xs space-y-1">
            <div className="flex items-center justify-between font-black text-[#2E2E2E]">
              <span>Assigned to {technician.name}</span>
              <span className="font-mono">{assignment.startTime} – {assignment.endTime}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-stone-700">
              <span>Status: <strong className="text-black uppercase">{assignment.status}</strong></span>
              {isLocked && (
                <span className="neo-badge bg-[#86efac] text-[#14532d] text-[9px] py-0 px-1">
                  <Lock className="h-2.5 w-2.5" /> Locked
                </span>
              )}
            </div>
            {assignment.overrideReason && (
              <p className="text-[11px] font-bold text-amber-900 italic pt-1">
                Note: {assignment.overrideReason}
              </p>
            )}
          </div>
        ) : (
          <div className="neo-card-sm p-2.5 bg-[#FAF8F5] text-xs font-bold text-stone-500 text-center">
            Currently Unassigned in Queue
          </div>
        )}

        {/* Missing Info Alert */}
        {request.missingInfoFlags && request.missingInfoFlags.length > 0 && (
          <div className="neo-card-sm bg-[#fef08a] p-2.5 text-xs text-[#2E2E2E] flex items-start gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-[#FF6F20] shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase">Missing Ticket Information:</span>
              <p className="text-[11px] text-stone-700 mt-0.5">
                {request.missingInfoFlags.join('; ')}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-[2.5px] border-[#2E2E2E] pt-3">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-white text-xs py-1.5 px-3 font-black"
          >
            Close
          </button>

          {onEditAssignment && !isLocked && (
            <button
              onClick={() => {
                onClose();
                onEditAssignment();
              }}
              className="neo-btn neo-btn-orange text-xs py-1.5 px-4 font-black flex items-center gap-1.5"
            >
              <UserCheck className="h-4 w-4" />
              <span>{assignment ? 'Modify Slot' : 'Assign to Technician'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
