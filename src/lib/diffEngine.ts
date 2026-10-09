import {
  ScheduleAssignment,
  ScheduleDiff,
  ServiceRequest,
  Technician,
} from './types';

export function computeScheduleDiff(
  previousAssignments: ScheduleAssignment[],
  currentAssignments: ScheduleAssignment[],
  previousVersionNum: number,
  requests: ServiceRequest[],
  technicians: Technician[],
  contextReason?: string
): ScheduleDiff {
  const reqMap = new Map<string, ServiceRequest>(requests.map((r) => [r.id, r]));
  const techMap = new Map<string, Technician>(technicians.map((t) => [t.id, t]));

  const prevByReq = new Map<string, ScheduleAssignment>(
    previousAssignments.map((a) => [a.requestId, a])
  );
  const currByReq = new Map<string, ScheduleAssignment>(
    currentAssignments.map((a) => [a.requestId, a])
  );

  const added: ScheduleAssignment[] = [];
  const removed: ScheduleAssignment[] = [];
  const modified: ScheduleDiff['modified'] = [];

  // Check current assignments
  for (const curr of currentAssignments) {
    const prev = prevByReq.get(curr.requestId);
    const req = reqMap.get(curr.requestId);
    const reqTitle = req ? `${req.id} (${req.title})` : curr.requestId;

    if (!prev) {
      // Newly assigned
      added.push(curr);
    } else {
      const techChanged = prev.technicianId !== curr.technicianId;
      const timeChanged =
        prev.startTime !== curr.startTime || prev.endTime !== curr.endTime;

      if (techChanged || timeChanged) {
        const oldTechName = techMap.get(prev.technicianId)?.name || prev.technicianId;
        const newTechName = techMap.get(curr.technicianId)?.name || curr.technicianId;

        let reason = '';
        if (techChanged && timeChanged) {
          reason = `Reassigned from ${oldTechName} (${prev.startTime}–${prev.endTime}) to ${newTechName} (${curr.startTime}–${curr.endTime})`;
        } else if (techChanged) {
          reason = `Reassigned from ${oldTechName} to ${newTechName} to balance workload or address disruption`;
        } else {
          reason = `Time shifted from ${prev.startTime}–${prev.endTime} to ${curr.startTime}–${curr.endTime}`;
        }

        if (curr.overrideReason) {
          reason += ` — ${curr.overrideReason}`;
        } else if (contextReason) {
          reason += ` — ${contextReason}`;
        }

        modified.push({
          requestId: curr.requestId,
          requestTitle: reqTitle,
          oldTechnicianId: prev.technicianId,
          newTechnicianId: curr.technicianId,
          oldStartTime: prev.startTime,
          newStartTime: curr.startTime,
          reason,
        });
      }
    }
  }

  // Check removed assignments
  for (const prev of previousAssignments) {
    if (!currByReq.has(prev.requestId)) {
      removed.push(prev);
    }
  }

  const unassignedChanges = {
    nowUnassigned: removed.map((a) => a.requestId),
    nowAssigned: added.map((a) => a.requestId),
  };

  const explanationParts: string[] = [];
  if (added.length > 0) explanationParts.push(`${added.length} newly assigned`);
  if (removed.length > 0) explanationParts.push(`${removed.length} moved to unassigned queue`);
  if (modified.length > 0) explanationParts.push(`${modified.length} modified/rescheduled`);

  const explanation =
    explanationParts.length > 0
      ? `Compared to v${previousVersionNum}: ${explanationParts.join(', ')}.`
      : `No changes detected compared to v${previousVersionNum}.`;

  return {
    previousVersionNumber: previousVersionNum,
    added,
    removed,
    modified,
    unassignedChanges,
    explanation,
  };
}
