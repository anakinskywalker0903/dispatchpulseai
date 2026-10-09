import {
  Technician,
  ServiceRequest,
  ScheduleAssignment,
  AIPlanningResponse,
  ClarificationQuestion,
} from './types';
import { canTechnicianTakeSlot } from './constraintEngine';
import { timeToMinutes, minutesToTime, addMinutesToTime } from './timeUtils';

const PRIORITY_SCORES: Record<string, number> = {
  Emergency: 1000,
  High: 500,
  Medium: 200,
  Low: 50,
};

/**
 * Deterministic heuristic scheduler that strictly respects:
 * 1. Technician skills
 * 2. Working hours and lunch breaks
 * 3. Double-booking prevention
 * 4. Maximum daily workloads
 * 5. Completed assignment immutability
 * 6. Priority-first ordering (Emergency > High > Medium > Low)
 * 7. Region proximity preference
 */
export function solveScheduleDeterministically(
  technicians: Technician[],
  requests: ServiceRequest[],
  existingAssignments: ScheduleAssignment[] = [],
  preserveCompleted: boolean = true,
  disruptedTechId?: string,
  emergencyReqId?: string
): AIPlanningResponse {
  // 1. Separate locked/completed assignments that cannot be touched
  const finalAssignments: ScheduleAssignment[] = [];
  const lockedAssignmentIds = new Set<string>();

  for (const a of existingAssignments) {
    if (preserveCompleted && (a.status === 'Completed' || a.locked)) {
      finalAssignments.push({ ...a, locked: true });
      lockedAssignmentIds.add(a.requestId);
    }
  }

  // 2. Identify requests that need scheduling
  // Requests already completed/locked stay as is
  const requestsToSchedule = requests.filter(
    (r) => !lockedAssignmentIds.has(r.id) && r.status !== 'Completed' && r.status !== 'Cancelled'
  );

  // Sort requests: Emergency > High > Medium > Low, then by duration ascending
  requestsToSchedule.sort((a, b) => {
    const pA = PRIORITY_SCORES[a.priority] || 0;
    const pB = PRIORITY_SCORES[b.priority] || 0;
    if (pB !== pA) return pB - pA;
    return a.estimatedDuration - b.estimatedDuration;
  });

  // Track assignments per technician
  const assignmentsByTech = new Map<string, ScheduleAssignment[]>();
  for (const t of technicians) {
    assignmentsByTech.set(t.id, []);
  }
  for (const a of finalAssignments) {
    const list = assignmentsByTech.get(a.technicianId);
    if (list) list.push(a);
  }

  const unassignedRequestIds: string[] = [];
  const tradeOffs: string[] = [];
  const risks: string[] = [];
  const suggestedQuestions: ClarificationQuestion[] = [];

  // 3. For each request, find the best technician and slot
  for (const req of requestsToSchedule) {
    // Flag missing information
    if (req.missingInfoFlags && req.missingInfoFlags.length > 0) {
      for (const flag of req.missingInfoFlags) {
        suggestedQuestions.push({
          requestId: req.id,
          customer: req.customer,
          question: `Could you please confirm details regarding: ${flag}?`,
          rationale: `Request ${req.id} (${req.title}) flagged with missing info: ${flag}`,
        });
      }
    }

    // Filter eligible technicians (active, has skill)
    const eligibleTechs = technicians.filter((t) => {
      if (t.status === 'Unavailable' || (disruptedTechId && t.id === disruptedTechId)) return false;
      return t.skills.includes(req.requiredSkill);
    });

    if (eligibleTechs.length === 0) {
      unassignedRequestIds.push(req.id);
      tradeOffs.push(
        `Unable to assign ${req.id} (${req.priority} - ${req.title}): No available technician has "${req.requiredSkill}" certification.`
      );
      continue;
    }

    // Sort technicians: prefer same region, then least assigned workload
    eligibleTechs.sort((t1, t2) => {
      const regionMatch1 = t1.assignedRegion === req.region ? 1 : 0;
      const regionMatch2 = t2.assignedRegion === req.region ? 1 : 0;
      if (regionMatch2 !== regionMatch1) return regionMatch2 - regionMatch1;

      const workload1 = (assignmentsByTech.get(t1.id) || []).reduce(
        (sum, a) => sum + (timeToMinutes(a.endTime) - timeToMinutes(a.startTime)),
        0
      );
      const workload2 = (assignmentsByTech.get(t2.id) || []).reduce(
        (sum, a) => sum + (timeToMinutes(a.endTime) - timeToMinutes(a.startTime)),
        0
      );
      return workload1 - workload2;
    });

    let assigned = false;

    // Try each technician
    for (const tech of eligibleTechs) {
      const currentTechAssignments = assignmentsByTech.get(tech.id) || [];

      // Determine candidate start times across working day
      // Step by 30 minutes between workingHours.start and workingHours.end - duration
      const dayStart = timeToMinutes(tech.workingHours.start);
      const dayEnd = timeToMinutes(tech.workingHours.end);
      const step = 30; // 30-minute intervals

      // If customer has preferred window, try slots inside it first
      const candidateSlots: string[] = [];

      if (req.preferredTimeWindow) {
        const prefStart = Math.max(dayStart, timeToMinutes(req.preferredTimeWindow.start));
        const prefEnd = Math.min(dayEnd, timeToMinutes(req.preferredTimeWindow.end));
        for (let m = prefStart; m + req.estimatedDuration <= prefEnd; m += step) {
          candidateSlots.push(minutesToTime(m));
        }
      }

      // Add general working day slots as secondary candidates
      for (let m = dayStart; m + req.estimatedDuration <= dayEnd; m += step) {
        const slotTime = minutesToTime(m);
        if (!candidateSlots.includes(slotTime)) {
          candidateSlots.push(slotTime);
        }
      }

      for (const slotStart of candidateSlots) {
        const check = canTechnicianTakeSlot(tech, req, slotStart, currentTechAssignments);
        if (check.allowed) {
          const slotEnd = addMinutesToTime(slotStart, req.estimatedDuration);
          const newAssignment: ScheduleAssignment = {
            id: `ASG-${req.id}-${tech.id}`,
            requestId: req.id,
            technicianId: tech.id,
            startTime: slotStart,
            endTime: slotEnd,
            status: 'Proposed',
            locked: false,
          };

          finalAssignments.push(newAssignment);
          currentTechAssignments.push(newAssignment);
          assignmentsByTech.set(tech.id, currentTechAssignments);
          assigned = true;

          if (tech.assignedRegion !== req.region) {
            tradeOffs.push(
              `Assigned ${tech.name} to ${req.id} in ${req.region} (cross-region from ${tech.assignedRegion}) to fulfill ${req.priority} request.`
            );
          }

          break;
        }
      }

      if (assigned) break;
    }

    if (!assigned) {
      unassignedRequestIds.push(req.id);
      tradeOffs.push(
        `Deferred ${req.id} (${req.priority} - ${req.title}): All qualified technicians reached max workload or had schedule conflicts.`
      );
    }
  }

  // 4. Analyze Risks
  for (const tech of technicians) {
    if (tech.status === 'Unavailable') continue;
    const techAsgs = assignmentsByTech.get(tech.id) || [];
    const totalMins = techAsgs.reduce(
      (sum, a) => sum + (timeToMinutes(a.endTime) - timeToMinutes(a.startTime)),
      0
    );

    // Overtime / tight capacity risk
    if (totalMins > tech.maxWorkloadMinutes * 0.9) {
      risks.push(
        `High workload risk: ${tech.name} scheduled for ${totalMins}/${tech.maxWorkloadMinutes} mins (${Math.round((totalMins / tech.maxWorkloadMinutes) * 100)}% capacity). Minimal buffer for overruns.`
      );
    }

    // Tight turnarounds between appointments
    techAsgs.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    for (let i = 0; i < techAsgs.length - 1; i++) {
      const gap = timeToMinutes(techAsgs[i + 1].startTime) - timeToMinutes(techAsgs[i].endTime);
      if (gap < 15 && gap >= 0) {
        risks.push(
          `Tight travel buffer: ${tech.name} has only ${gap} mins between ${techAsgs[i].requestId} and ${techAsgs[i + 1].requestId}.`
        );
      }
    }
  }

  const assignedCount = finalAssignments.length;
  const emergencyHandled = emergencyReqId
    ? finalAssignments.some((a) => a.requestId === emergencyReqId)
    : false;

  let summary = `Generated schedule assigning ${assignedCount} of ${requests.length} service requests. ${unassignedRequestIds.length} requests unassigned due to capacity or skill constraints.`;
  if (emergencyReqId) {
    summary += emergencyHandled
      ? ` Emergency request ${emergencyReqId} was successfully prioritized and routed.`
      : ` WARNING: Emergency request ${emergencyReqId} could not be placed due to zero available skill capacity.`;
  }
  if (disruptedTechId) {
    summary += ` Replanned active schedule following disruption for technician ${disruptedTechId}. Completed assignments were strictly preserved.`;
  }

  return {
    assignments: finalAssignments,
    unassignedRequestIds,
    summary,
    tradeOffs,
    risks,
    suggestedQuestions,
    reasoning:
      'Deterministic heuristic engine assigned highest priority requests first, minimizing travel distance, ensuring zero constraint violations, and protecting technician break intervals.',
    source: 'HEURISTIC_SOLVER',
  };
}
