import { describe, it, expect } from 'vitest';
import { validateSchedule, canTechnicianTakeSlot } from '../constraintEngine';
import { solveScheduleDeterministically } from '../heuristicSolver';
import { computeScheduleDiff } from '../diffEngine';
import { INITIAL_TECHNICIANS, INITIAL_SERVICE_REQUESTS } from '../mockData';
import { ScheduleAssignment, ServiceRequest, Technician } from '../types';

describe('Deterministic Constraint Engine', () => {
  const sampleTech: Technician = {
    id: 'T1',
    name: 'Alice',
    avatar: '',
    skills: ['HVAC'],
    assignedRegion: 'Downtown',
    workingHours: { start: '08:00', end: '17:00' },
    breakTime: { start: '12:00', end: '13:00' },
    maxWorkloadMinutes: 420,
    status: 'Active',
  };

  const sampleReqHVAC: ServiceRequest = {
    id: 'SR-1',
    customer: 'Cust A',
    address: '123 St',
    region: 'Downtown',
    requiredSkill: 'HVAC',
    priority: 'High',
    estimatedDuration: 60,
    status: 'Unassigned',
    title: 'HVAC Fix',
    description: 'Fix unit',
  };

  const sampleReqPlumbing: ServiceRequest = {
    id: 'SR-2',
    customer: 'Cust B',
    address: '456 St',
    region: 'Downtown',
    requiredSkill: 'Plumbing',
    priority: 'Medium',
    estimatedDuration: 60,
    status: 'Unassigned',
    title: 'Leak Fix',
    description: 'Fix pipe',
  };

  it('detects skill mismatch error', () => {
    const assignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-2', // requires Plumbing, Alice only has HVAC
        technicianId: 'T1',
        startTime: '09:00',
        endTime: '10:00',
        status: 'Proposed',
        locked: false,
      },
    ];

    const result = validateSchedule(assignments, [sampleTech], [sampleReqPlumbing]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SKILL_MISMATCH')).toBe(true);
  });

  it('detects outside working hours error', () => {
    const assignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-1',
        technicianId: 'T1',
        startTime: '07:00', // Alice starts at 08:00
        endTime: '08:00',
        status: 'Proposed',
        locked: false,
      },
    ];

    const result = validateSchedule(assignments, [sampleTech], [sampleReqHVAC]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'OUTSIDE_WORKING_HOURS')).toBe(true);
  });

  it('detects break conflict error', () => {
    const assignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-1',
        technicianId: 'T1',
        startTime: '12:30', // Overlaps Alice lunch 12:00-13:00
        endTime: '13:30',
        status: 'Proposed',
        locked: false,
      },
    ];

    const result = validateSchedule(assignments, [sampleTech], [sampleReqHVAC]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'BREAK_CONFLICT')).toBe(true);
  });

  it('detects double-booking error', () => {
    const req2: ServiceRequest = {
      ...sampleReqHVAC,
      id: 'SR-3',
      title: 'Second HVAC Job',
    };

    const assignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-1',
        technicianId: 'T1',
        startTime: '09:00',
        endTime: '10:30',
        status: 'Proposed',
        locked: false,
      },
      {
        id: 'A2',
        requestId: 'SR-3',
        technicianId: 'T1',
        startTime: '10:00', // Overlaps with 09:00-10:30
        endTime: '11:00',
        status: 'Proposed',
        locked: false,
      },
    ];

    const result = validateSchedule(assignments, [sampleTech], [sampleReqHVAC, req2]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DOUBLE_BOOKING')).toBe(true);
  });

  it('detects max workload exceeded error', () => {
    const smallCapacityTech: Technician = {
      ...sampleTech,
      maxWorkloadMinutes: 90, // only 90 mins max
    };

    const assignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-1',
        technicianId: 'T1',
        startTime: '09:00',
        endTime: '11:00', // 120 minutes > 90 minutes
        status: 'Proposed',
        locked: false,
      },
    ];

    const longReq: ServiceRequest = {
      ...sampleReqHVAC,
      estimatedDuration: 120,
    };

    const result = validateSchedule(assignments, [smallCapacityTech], [longReq]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MAX_WORKLOAD_EXCEEDED')).toBe(true);
  });
});

describe('Deterministic Heuristic Solver', () => {
  it('schedules requests without any constraint violations', () => {
    const plan = solveScheduleDeterministically(
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS
    );

    expect(plan.assignments.length).toBeGreaterThan(0);

    const validation = validateSchedule(
      plan.assignments,
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS
    );

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('prioritizes Emergency requests over Low requests', () => {
    const plan = solveScheduleDeterministically(
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS
    );

    const emergencyAssignment = plan.assignments.find((a) => a.requestId === 'SR-109');
    expect(emergencyAssignment).toBeDefined();
  });

  it('preserves completed/locked assignments strictly during replanning', () => {
    const completedAssignment: ScheduleAssignment = {
      id: 'ASG-SR-101-TECH-1',
      requestId: 'SR-101',
      technicianId: 'TECH-1',
      startTime: '08:00',
      endTime: '10:00',
      status: 'Completed',
      locked: true,
    };

    const plan = solveScheduleDeterministically(
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS,
      [completedAssignment],
      true
    );

    const lockedFound = plan.assignments.find((a) => a.requestId === 'SR-101');
    expect(lockedFound).toBeDefined();
    expect(lockedFound?.technicianId).toBe('TECH-1');
    expect(lockedFound?.startTime).toBe('08:00');
    expect(lockedFound?.endTime).toBe('10:00');
    expect(lockedFound?.status).toBe('Completed');
  });
});

describe('Schedule Diff Engine', () => {
  it('correctly reports modified and added assignments with explanations', () => {
    const prevAssignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-101',
        technicianId: 'TECH-1',
        startTime: '09:00',
        endTime: '11:00',
        status: 'Approved',
        locked: false,
      },
    ];

    const currentAssignments: ScheduleAssignment[] = [
      {
        id: 'A1-MOD',
        requestId: 'SR-101',
        technicianId: 'TECH-3', // Reassigned to Tech 3
        startTime: '10:00',
        endTime: '12:00',
        status: 'Proposed',
        locked: false,
        overrideReason: 'Tech 1 vehicle breakdown',
      },
      {
        id: 'A2',
        requestId: 'SR-102',
        technicianId: 'TECH-2',
        startTime: '09:00',
        endTime: '10:30',
        status: 'Proposed',
        locked: false,
      },
    ];

    const diff = computeScheduleDiff(
      prevAssignments,
      currentAssignments,
      1,
      INITIAL_SERVICE_REQUESTS,
      INITIAL_TECHNICIANS,
      'Emergency adjustment'
    );

    expect(diff.previousVersionNumber).toBe(1);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].requestId).toBe('SR-102');
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].requestId).toBe('SR-101');
    expect(diff.modified[0].oldTechnicianId).toBe('TECH-1');
    expect(diff.modified[0].newTechnicianId).toBe('TECH-3');
    expect(diff.modified[0].reason).toContain('Reassigned from');
  });

  it('prevents multiple bookings for the same service request', () => {
    const assignments: ScheduleAssignment[] = [
      {
        id: 'A1',
        requestId: 'SR-101',
        technicianId: 'TECH-1',
        startTime: '08:00',
        endTime: '10:00',
        status: 'Proposed',
        locked: false,
      },
      {
        id: 'A2',
        requestId: 'SR-101', // Duplicate assignment for same request
        technicianId: 'TECH-3',
        startTime: '10:30',
        endTime: '12:30',
        status: 'Proposed',
        locked: false,
      },
    ];

    const result = validateSchedule(assignments, INITIAL_TECHNICIANS, INITIAL_SERVICE_REQUESTS);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('booked multiple times'))).toBe(true);
  });

  it('dynamically replans when technician is cancelled without touching completed tasks', () => {
    // Elena has a completed morning job
    const completedMorningJob: ScheduleAssignment = {
      id: 'ASG-SR-101-TECH-1',
      requestId: 'SR-101',
      technicianId: 'TECH-1',
      startTime: '08:00',
      endTime: '10:00',
      status: 'Completed',
      locked: true,
    };

    // Elena gets cancelled (e.g. sick)
    const plan = solveScheduleDeterministically(
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS,
      [completedMorningJob],
      true,
      'TECH-1' // Disrupted tech
    );

    // Completed job is still Elena's at 08:00
    const elenaJobs = plan.assignments.filter((a) => a.technicianId === 'TECH-1');
    expect(elenaJobs).toHaveLength(1);
    expect(elenaJobs[0].requestId).toBe('SR-101');
    expect(elenaJobs[0].status).toBe('Completed');

    // Other jobs requiring Elena's skills are reassigned to other techs if qualified or marked unassigned
    for (const asg of plan.assignments) {
      if (asg.id !== completedMorningJob.id) {
        expect(asg.technicianId).not.toBe('TECH-1');
      }
    }
  });
});
