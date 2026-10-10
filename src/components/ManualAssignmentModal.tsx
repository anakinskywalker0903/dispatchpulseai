'use client';

import React, { useState, useEffect } from 'react';
import {
  Technician,
  ServiceRequest,
  ScheduleAssignment,
} from '@/lib/types';
import { canTechnicianTakeSlot } from '@/lib/constraintEngine';
import { addMinutesToTime, formatDuration } from '@/lib/timeUtils';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  MapPin,
  Lock,
  UserCheck,
} from 'lucide-react';

interface ManualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: ScheduleAssignment | null;
  request?: ServiceRequest | null;
  technicians: Technician[];
  requests: ServiceRequest[];
  allAssignments: ScheduleAssignment[];
  onSave: (updatedAssignment: ScheduleAssignment, overrideReason: string) => void;
  onUnassign?: (assignmentId: string) => void;
}

export const ManualAssignmentModal: React.FC<ManualAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  request,
  technicians,
  requests,
  allAssignments,
  onSave,
  onUnassign,
}) => {
  const currentReq =
    request ||
    (assignment ? requests.find((r) => r.id === assignment.requestId) : null);

  const [techId, setTechId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [status, setStatus] = useState<ScheduleAssignment['status']>('Approved');
  const [overrideReason, setOverrideReason] = useState<string>('');

  useEffect(() => {
    if (assignment) {
      setTechId(assignment.technicianId);
      setStartTime(assignment.startTime);
      setStatus(assignment.status);
      setOverrideReason(assignment.overrideReason || '');
    } else if (technicians.length > 0) {
      setTechId(technicians[0].id);
      setStartTime('09:00');
      setStatus('Approved');
      setOverrideReason('');
    }
  }, [assignment, technicians, isOpen]);

  if (!isOpen || !currentReq) return null;

  const duration = currentReq.estimatedDuration;
  const calculatedEndTime = addMinutesToTime(startTime, duration);

  const selectedTech = technicians.find((t) => t.id === techId);

  // Check deterministic constraints
  let validationError: string | null = null;
  if (selectedTech) {
    const otherAssignments = allAssignments.filter(
      (a) =>
        a.technicianId === techId &&
        (!assignment || a.id !== assignment.id)
    );
    const check = canTechnicianTakeSlot(
      selectedTech,
      currentReq,
      startTime,
      otherAssignments
    );
    if (!check.allowed) {
      validationError = check.reason || 'Constraint violation';
    }
  }

  const handleSave = () => {
    if (!selectedTech || validationError) return;

    const updated: ScheduleAssignment = {
      id: assignment ? assignment.id : `ASG-${currentReq.id}-${selectedTech.id}`,
      requestId: currentReq.id,
      technicianId: selectedTech.id,
      startTime,
      endTime: calculatedEndTime,
      status,
      locked: status === 'Completed',
      overrideReason: overrideReason.trim() || 'Dispatcher manual override',
    };

    onSave(updated, overrideReason.trim() || 'Manual adjustment by dispatcher');
    onClose();
  };

  const isLocked = assignment?.locked || assignment?.status === 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg neo-card p-6 bg-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#2E2E2E] pb-3">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-[#2E2E2E]">
              {assignment ? 'Modify Work Order Slot' : 'Assign Service Request'}
            </h3>
            <p className="text-xs font-bold text-stone-500">
              Deterministic validation prevents illegal assignments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 neo-box-sm bg-white hover:bg-[#F1F1F1] text-[#2E2E2E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Request Summary Card */}
        <div className="neo-card-sm p-3.5 bg-[#FAF8F5] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="neo-badge bg-[#c8e6ff] text-[10px]">
              {currentReq.id} • {currentReq.customer}
            </span>
            <span className="neo-badge bg-[#fef08a] text-[10px]">
              {currentReq.priority}
            </span>
          </div>
          <p className="font-black text-sm text-[#2E2E2E]">{currentReq.title}</p>
          <div className="flex flex-wrap gap-2 text-stone-600 pt-1 font-bold text-[11px]">
            <span className="flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5 text-[#FF6F20]" />
              Skill: <strong className="text-[#2E2E2E]">{currentReq.requiredSkill}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-stone-500" /> {currentReq.region}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-stone-500" /> {formatDuration(duration)}
            </span>
          </div>
        </div>

        {isLocked ? (
          <div className="neo-card-sm bg-[#86efac]/50 p-4 text-xs text-[#14532d] flex items-start gap-2 font-bold">
            <Lock className="h-4 w-4 shrink-0 text-emerald-800 mt-0.5" />
            <div>
              <p className="font-black uppercase">Assignment is Completed & Locked</p>
              <p className="text-stone-700 mt-1 font-medium">
                Completed work orders are immutable and cannot be moved or altered per system rules.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Technician Select */}
            <div>
              <label className="block text-xs font-black uppercase text-[#2E2E2E] mb-1">
                Assign Technician:
              </label>
              <select
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
                className="w-full neo-card-sm px-3 py-2 text-xs font-bold text-[#2E2E2E] bg-white focus:outline-none"
              >
                {technicians.map((t) => {
                  const hasSkill = t.skills.includes(currentReq.requiredSkill);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.assignedRegion}) {hasSkill ? '✓ Qualified' : '❌ Lacks Skill'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Time Slot Select */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#2E2E2E] mb-1">
                  Start Time:
                </label>
                <input
                  type="time"
                  step="1800"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full neo-card-sm px-3 py-2 text-xs font-mono font-bold text-[#2E2E2E] bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#2E2E2E] mb-1">
                  End Time (Calculated):
                </label>
                <div className="w-full neo-card-sm px-3 py-2 text-xs font-mono font-bold text-stone-700 bg-[#F1F1F1]">
                  {calculatedEndTime} ({duration}m)
                </div>
              </div>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-black uppercase text-[#2E2E2E] mb-1">
                Assignment Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full neo-card-sm px-3 py-2 text-xs font-bold text-[#2E2E2E] bg-white focus:outline-none"
              >
                <option value="Approved">Approved (Active Shift)</option>
                <option value="Completed">Completed (Locks assignment permanently)</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Proposed">Proposed (Draft)</option>
              </select>
            </div>

            {/* Override Reason Input */}
            <div>
              <label className="block text-xs font-black uppercase text-[#2E2E2E] mb-1">
                Dispatcher Justification / Notes:
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. VIP client expedited; requested by customer."
                className="w-full neo-card-sm px-3 py-2 text-xs font-bold text-[#2E2E2E] bg-white focus:outline-none"
              />
            </div>

            {/* Validation Feedback */}
            {validationError ? (
              <div className="neo-card-sm bg-[#ffdad6] p-3 text-xs text-red-900 flex items-start gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black uppercase">Constraint Conflict: </span>
                  {validationError}
                </div>
              </div>
            ) : (
              <div className="neo-card-sm bg-[#86efac]/40 p-2.5 text-xs text-[#14532d] flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>Deterministic checks passed. No double booking or skill mismatch.</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-[2.5px] border-[#2E2E2E] pt-3">
          {assignment && onUnassign && !isLocked ? (
            <button
              onClick={() => {
                onUnassign(assignment.id);
                onClose();
              }}
              className="text-xs font-black text-red-700 hover:underline uppercase"
            >
              Unassign Ticket
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="neo-btn neo-btn-white text-xs py-1.5 px-3"
            >
              Cancel
            </button>

            {!isLocked && (
              <button
                onClick={handleSave}
                disabled={Boolean(validationError)}
                className="neo-btn neo-btn-orange text-xs py-1.5 px-4 flex items-center gap-1.5 font-black"
              >
                <UserCheck className="h-4 w-4" />
                <span>Save Assignment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
