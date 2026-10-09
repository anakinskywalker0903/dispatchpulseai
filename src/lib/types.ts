export type Skill =
  | 'HVAC'
  | 'Electrical'
  | 'Plumbing'
  | 'Appliances'
  | 'Networking'
  | 'Security';

export type Region = 'North' | 'South' | 'Downtown' | 'East' | 'West';

export type Priority = 'Emergency' | 'High' | 'Medium' | 'Low';

export type RequestStatus =
  | 'Unassigned'
  | 'Scheduled'
  | 'In-Progress'
  | 'Completed'
  | 'Disrupted'
  | 'Cancelled';

export interface TimeWindow {
  start: string; // HH:mm format, e.g. "09:00"
  end: string;   // HH:mm format, e.g. "13:00"
}

export interface ServiceRequest {
  id: string; // e.g. "SR-101"
  customer: string;
  address: string;
  region: Region;
  requiredSkill: Skill;
  priority: Priority;
  estimatedDuration: number; // minutes, e.g. 90
  preferredTimeWindow?: TimeWindow | null;
  status: RequestStatus;
  title: string;
  description: string;
  missingInfoFlags?: string[];
  completedAt?: string;
}

export interface Technician {
  id: string; // e.g. "TECH-1"
  name: string;
  avatar: string;
  skills: Skill[];
  assignedRegion: Region;
  workingHours: TimeWindow; // e.g. { start: "08:00", end: "17:00" }
  breakTime: TimeWindow;     // e.g. { start: "12:00", end: "13:00" }
  maxWorkloadMinutes: number; // e.g. 420 (7 hours)
  status: 'Active' | 'Unavailable' | 'Disrupted';
  disruptionReason?: string;
}

export interface ScheduleAssignment {
  id: string;
  requestId: string;
  technicianId: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  status: 'Proposed' | 'Approved' | 'In-Progress' | 'Completed' | 'Disrupted';
  locked: boolean;   // Completed or firmly locked items cannot be moved
  overrideReason?: string;
  disruptionNote?: string;
}

export interface ScheduleDiff {
  previousVersionNumber: number;
  added: ScheduleAssignment[];
  removed: ScheduleAssignment[];
  modified: Array<{
    requestId: string;
    requestTitle: string;
    oldTechnicianId: string;
    newTechnicianId: string;
    oldStartTime: string;
    newStartTime: string;
    reason: string;
  }>;
  unassignedChanges: {
    nowUnassigned: string[];
    nowAssigned: string[];
  };
  explanation: string;
}

export interface ClarificationQuestion {
  requestId: string;
  customer: string;
  question: string;
  rationale: string;
}

export interface ScheduleVersion {
  versionNumber: number;
  id: string;
  createdAt: string;
  source:
    | 'AI_INITIAL_PROPOSAL'
    | 'DISPATCHER_APPROVAL'
    | 'MANUAL_OVERRIDE'
    | 'REPLAN_CANCELLATION'
    | 'REPLAN_EMERGENCY';
  status: 'Draft' | 'Pending_Approval' | 'Approved' | 'Archived';
  assignments: ScheduleAssignment[];
  unassignedRequestIds: string[];
  summary: string;
  tradeOffs: string[];
  risks: string[];
  suggestedQuestions: ClarificationQuestion[];
  diffFromPrevious?: ScheduleDiff;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'PLAN_PROPOSED'
    | 'PLAN_APPROVED'
    | 'MANUAL_OVERRIDE'
    | 'TECHNICIAN_CANCELLED'
    | 'EMERGENCY_INJECTED'
    | 'PLAN_REVISED'
    | 'NOTIFICATION_SENT'
    | 'VERSION_RESTORED';
  actor: 'AI_AGENT' | 'DISPATCHER' | 'SYSTEM';
  summary: string;
  details?: Record<string, any>;
}

export interface MockNotification {
  id: string;
  timestamp: string;
  recipient: string;
  recipientRole: 'Technician' | 'Customer' | 'Dispatcher';
  channel: 'SMS' | 'Push Notification' | 'Email';
  subject: string;
  body: string;
  status: 'Delivered';
}

export interface ValidationIssue {
  type: 'ERROR' | 'WARNING';
  code:
    | 'SKILL_MISMATCH'
    | 'OUTSIDE_WORKING_HOURS'
    | 'BREAK_CONFLICT'
    | 'DOUBLE_BOOKING'
    | 'MAX_WORKLOAD_EXCEEDED'
    | 'REGION_MISMATCH'
    | 'PREFERRED_WINDOW_VIOLATION'
    | 'LOCKED_ITEM_MODIFIED';
  message: string;
  technicianId?: string;
  requestId?: string;
  assignmentId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface AIPlanningRequest {
  technicians: Technician[];
  requests: ServiceRequest[];
  existingAssignments?: ScheduleAssignment[];
  preserveCompleted?: boolean;
  disruptionContext?: {
    type: 'TECHNICIAN_CANCELLATION' | 'EMERGENCY_REQUEST';
    cancelledTechnicianId?: string;
    emergencyRequestId?: string;
    reason: string;
  };
}

export interface AIPlanningResponse {
  assignments: ScheduleAssignment[];
  unassignedRequestIds: string[];
  summary: string;
  tradeOffs: string[];
  risks: string[];
  suggestedQuestions: ClarificationQuestion[];
  reasoning: string;
  source: 'GROQ_LLM' | 'HEURISTIC_SOLVER';
}
