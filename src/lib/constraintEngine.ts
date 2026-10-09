import {
  Technician,
  ServiceRequest,
  ScheduleAssignment,
  ValidationResult,
  ValidationIssue,
} from './types';
import {
  timeToMinutes,
  intervalsOverlap,
  isWithinWindow,
} from './timeUtils';

export function validateSchedule(
  assignments: ScheduleAssignment[],
  technicians: Technician[],
  requests: ServiceRequest[]
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const techMap = new Map<string, Technician>(technicians.map((t) => [t.id, t]));
  const reqMap = new Map<string, ServiceRequest>(requests.map((r) => [r.id, r]));

  // Track workloads per tech
  const techWorkloads = new Map<string, number>();
  // Group assignments per tech to check overlaps
  const techAssignments = new Map<string, ScheduleAssignment[]>();
  // Group assignments per request to check multiple bookings
  const requestBookings = new Map<string, ScheduleAssignment[]>();

  for (const assignment of assignments) {
    const tech = techMap.get(assignment.technicianId);
    const req = reqMap.get(assignment.requestId);

    if (!tech) {
      errors.push({
        type: 'ERROR',
        code: 'SKILL_MISMATCH',
        message: `Unknown technician ${assignment.technicianId}`,
        assignmentId: assignment.id,
      });
      continue;
    }

    if (!req) {
      errors.push({
        type: 'ERROR',
        code: 'SKILL_MISMATCH',
        message: `Unknown service request ${assignment.requestId}`,
        assignmentId: assignment.id,
      });
      continue;
    }

    // Check Technician Status
    if (tech.status === 'Unavailable' && assignment.status !== 'Completed') {
      errors.push({
        type: 'ERROR',
        code: 'OUTSIDE_WORKING_HOURS',
        message: `Technician ${tech.name} is marked as Unavailable (${tech.disruptionReason || 'Unassigned'})`,
        technicianId: tech.id,
        assignmentId: assignment.id,
        requestId: req.id,
      });
    }

    // 1. Skill Match (Hard Constraint)
    if (!tech.skills.includes(req.requiredSkill)) {
      errors.push({
        type: 'ERROR',
        code: 'SKILL_MISMATCH',
        message: `${tech.name} does not possess required skill "${req.requiredSkill}" for ${req.title} (${req.id}). Required skills: [${tech.skills.join(', ')}]`,
        technicianId: tech.id,
        requestId: req.id,
        assignmentId: assignment.id,
      });
    }

    // 2. Working Hours (Hard Constraint)
    const isWithinHours = isWithinWindow(
      assignment.startTime,
      assignment.endTime,
      tech.workingHours.start,
      tech.workingHours.end
    );
    if (!isWithinHours) {
      errors.push({
        type: 'ERROR',
        code: 'OUTSIDE_WORKING_HOURS',
        message: `Assignment ${assignment.startTime}–${assignment.endTime} is outside ${tech.name}'s working hours (${tech.workingHours.start}–${tech.workingHours.end})`,
        technicianId: tech.id,
        requestId: req.id,
        assignmentId: assignment.id,
      });
    }

    // 3. Break Conflict (Hard Constraint)
    if (tech.breakTime) {
      const overlapsBreak = intervalsOverlap(
        assignment.startTime,
        assignment.endTime,
        tech.breakTime.start,
        tech.breakTime.end
      );
      if (overlapsBreak) {
        errors.push({
          type: 'ERROR',
          code: 'BREAK_CONFLICT',
          message: `Assignment overlaps ${tech.name}'s scheduled lunch break (${tech.breakTime.start}–${tech.breakTime.end})`,
          technicianId: tech.id,
          requestId: req.id,
          assignmentId: assignment.id,
        });
      }
    }

    // 4. Duration Check
    const startMins = timeToMinutes(assignment.startTime);
    const endMins = timeToMinutes(assignment.endTime);
    const assignedDuration = endMins - startMins;
    if (assignedDuration !== req.estimatedDuration) {
      warnings.push({
        type: 'WARNING',
        code: 'PREFERRED_WINDOW_VIOLATION',
        message: `Assigned duration (${assignedDuration}m) does not match estimated job duration (${req.estimatedDuration}m) for ${req.id}`,
        technicianId: tech.id,
        requestId: req.id,
        assignmentId: assignment.id,
      });
    }

    // 5. Region match (Soft Constraint / Warning)
    if (tech.assignedRegion !== req.region) {
      warnings.push({
        type: 'WARNING',
        code: 'REGION_MISMATCH',
        message: `${tech.name} primary region is ${tech.assignedRegion}, but job ${req.id} is in ${req.region} (travel overhead applies)`,
        technicianId: tech.id,
        requestId: req.id,
        assignmentId: assignment.id,
      });
    }

    // 6. Customer Preferred Time Window (Soft Constraint / Warning)
    if (req.preferredTimeWindow) {
      const fitsWindow = isWithinWindow(
        assignment.startTime,
        assignment.endTime,
        req.preferredTimeWindow.start,
        req.preferredTimeWindow.end
      );
      if (!fitsWindow) {
        warnings.push({
          type: 'WARNING',
          code: 'PREFERRED_WINDOW_VIOLATION',
          message: `Assignment for ${req.id} (${assignment.startTime}–${assignment.endTime}) is outside customer's preferred window (${req.preferredTimeWindow.start}–${req.preferredTimeWindow.end})`,
          technicianId: tech.id,
          requestId: req.id,
          assignmentId: assignment.id,
        });
      }
    }

    // Workload aggregation
    const currentWorkload = techWorkloads.get(tech.id) || 0;
    techWorkloads.set(tech.id, currentWorkload + assignedDuration);

    // Grouping
    const existingList = techAssignments.get(tech.id) || [];
    existingList.push(assignment);
    techAssignments.set(tech.id, existingList);

    const existingReqBookings = requestBookings.get(req.id) || [];
    existingReqBookings.push(assignment);
    requestBookings.set(req.id, existingReqBookings);
  }

  // 7. Double-booking check per technician (Hard Constraint)
  techAssignments.forEach((assignmentsForTech, techId) => {
    const tech = techMap.get(techId);
    const techName = tech?.name || techId;

    for (let i = 0; i < assignmentsForTech.length; i++) {
      for (let j = i + 1; j < assignmentsForTech.length; j++) {
        const a1 = assignmentsForTech[i];
        const a2 = assignmentsForTech[j];

        if (intervalsOverlap(a1.startTime, a1.endTime, a2.startTime, a2.endTime)) {
          const r1 = reqMap.get(a1.requestId);
          const r2 = reqMap.get(a2.requestId);
          errors.push({
            type: 'ERROR',
            code: 'DOUBLE_BOOKING',
            message: `Double booking detected for ${techName}: ${r1?.title || a1.requestId} (${a1.startTime}–${a1.endTime}) overlaps with ${r2?.title || a2.requestId} (${a2.startTime}–${a2.endTime})`,
            technicianId: techId,
            assignmentId: a1.id,
          });
        }
      }
    }
  });

  // 8. Multiple bookings for the same request (Hard Constraint)
  requestBookings.forEach((bookings, reqId) => {
    if (bookings.length > 1) {
      errors.push({
        type: 'ERROR',
        code: 'DOUBLE_BOOKING',
        message: `Service request ${reqId} is booked multiple times (${bookings.length} assignments)`,
        requestId: reqId,
      });
    }
  });

  // 9. Max Workload per technician (Hard Constraint)
  techWorkloads.forEach((workload, techId) => {
    const tech = techMap.get(techId);
    if (tech && workload > tech.maxWorkloadMinutes) {
      errors.push({
        type: 'ERROR',
        code: 'MAX_WORKLOAD_EXCEEDED',
        message: `${tech.name} scheduled for ${workload} mins, exceeding maximum daily workload of ${tech.maxWorkloadMinutes} mins by ${workload - tech.maxWorkloadMinutes} mins`,
        technicianId: tech.id,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function canTechnicianTakeSlot(
  technician: Technician,
  request: ServiceRequest,
  startTime: string,
  existingAssignmentsForTech: ScheduleAssignment[]
): { allowed: boolean; reason?: string } {
  // 1. Skill check
  if (!technician.skills.includes(request.requiredSkill)) {
    return {
      allowed: false,
      reason: `Technician lacks skill "${request.requiredSkill}"`,
    };
  }

  // 2. Technician Status
  if (technician.status === 'Unavailable') {
    return {
      allowed: false,
      reason: `Technician is unavailable (${technician.disruptionReason || 'Off-duty'})`,
    };
  }

  const startMins = timeToMinutes(startTime);
  const endMins = startMins + request.estimatedDuration;
  const endTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;

  // 3. Shift bounds
  if (!isWithinWindow(startTime, endTime, technician.workingHours.start, technician.workingHours.end)) {
    return {
      allowed: false,
      reason: `Slot ${startTime}–${endTime} falls outside working hours (${technician.workingHours.start}–${technician.workingHours.end})`,
    };
  }

  // 4. Lunch break
  if (technician.breakTime && intervalsOverlap(startTime, endTime, technician.breakTime.start, technician.breakTime.end)) {
    return {
      allowed: false,
      reason: `Slot overlaps lunch break (${technician.breakTime.start}–${technician.breakTime.end})`,
    };
  }

  // 5. Double-booking
  for (const existing of existingAssignmentsForTech) {
    if (intervalsOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
      return {
        allowed: false,
        reason: `Slot overlaps with existing assignment (${existing.startTime}–${existing.endTime})`,
      };
    }
  }

  // 6. Max workload
  const currentWorkload = existingAssignmentsForTech.reduce((acc, a) => {
    return acc + (timeToMinutes(a.endTime) - timeToMinutes(a.startTime));
  }, 0);
  if (currentWorkload + request.estimatedDuration > technician.maxWorkloadMinutes) {
    return {
      allowed: false,
      reason: `Exceeds max workload limit of ${technician.maxWorkloadMinutes} mins`,
    };
  }

  return { allowed: true };
}
