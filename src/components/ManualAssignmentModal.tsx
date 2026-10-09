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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              {assignment ? 'Modify Assignment' : 'Assign Service Request'}
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic validation will prevent invalid schedules.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Request Summary Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-400 font-mono">
              {currentReq.id} • {currentReq.customer}
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 font-semibold text-slate-300">
              {currentReq.priority}
            </span>
          </div>
          <p className="font-medium text-slate-200">{currentReq.title}</p>
          <div className="flex flex-wrap gap-2 text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3 text-indigo-400" />
              Req Skill: <strong className="text-white">{currentReq.requiredSkill}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-500" /> {currentReq.region}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" /> {formatDuration(duration)}
            </span>
          </div>
        </div>

        {isLocked ? (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-300 flex items-start gap-2">
            <Lock className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold">Assignment is Completed & Locked</p>
              <p className="text-slate-400 mt-1">
                Completed assignments are immutable and cannot be rescheduled or modified per system requirements.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Technician Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Technician:
              </label>
              <select
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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

            {/* Time Slot Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Start Time:
                </label>
                <input
                  type="time"
                  step="1800"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  End Time (Calculated):
                </label>
                <div className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400 font-mono">
                  {calculatedEndTime} ({duration} mins)
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assignment Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Approved">Approved (Active Shift)</option>
                <option value="Completed">Completed (Locks assignment permanently)</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Proposed">Proposed (Draft)</option>
              </select>
            </div>

            {/* Override Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dispatcher Justification / Notes:
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Requested by customer directly; expedited VIP client."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Validation Feedback Banner */}
            {validationError ? (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Constraint Conflict: </span>
                  {validationError}
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Deterministic checks passed. No double booking or skill mismatch.</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          {assignment && onUnassign && !isLocked ? (
            <button
              onClick={() => {
                onUnassign(assignment.id);
                onClose();
              }}
              className="text-xs font-medium text-rose-400 hover:text-rose-300"
            >
              Unassign Ticket
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            {!isLocked && (
              <button
                onClick={handleSave}
                disabled={Boolean(validationError)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
