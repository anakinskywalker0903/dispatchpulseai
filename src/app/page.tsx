'use client';

import React, { useState, useEffect } from 'react';
import {
  Technician,
  ServiceRequest,
  ScheduleAssignment,
  ScheduleVersion,
  AuditLogEntry,
  MockNotification,
} from '@/lib/types';
import {
  INITIAL_TECHNICIANS,
  INITIAL_SERVICE_REQUESTS,
  EMERGENCY_SIMULATION_REQUEST,
} from '@/lib/mockData';
import { validateSchedule } from '@/lib/constraintEngine';
import { solveScheduleDeterministically } from '@/lib/heuristicSolver';
import { computeScheduleDiff } from '@/lib/diffEngine';

import { Header } from '@/components/Header';
import { ApprovalBanner } from '@/components/ApprovalBanner';
import { TimelineGrid } from '@/components/TimelineGrid';
import { ServiceRequestQueue } from '@/components/ServiceRequestQueue';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { ManualAssignmentModal } from '@/components/ManualAssignmentModal';
import { VersionHistoryModal } from '@/components/VersionHistoryModal';
import { AuditLogDrawer } from '@/components/AuditLogDrawer';
import { NotificationsDrawer } from '@/components/NotificationsDrawer';
import { RequestDetailModal } from '@/components/RequestDetailModal';

export default function DispatchDashboard() {
  // Primary Domain State
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_SERVICE_REQUESTS);
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [unassignedIds, setUnassignedIds] = useState<string[]>(
    INITIAL_SERVICE_REQUESTS.map((r) => r.id)
  );

  // Versioning & Audit
  const [versions, setVersions] = useState<ScheduleVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ScheduleVersion | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);

  // UI & Drawer States
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);

  // Selection & Modal States
  const [selectedAssignment, setSelectedAssignment] = useState<ScheduleAssignment | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Initialize Initial Schedule (Baseline Plan v1)
  useEffect(() => {
    // Generate initial baseline schedule
    const baseline = solveScheduleDeterministically(
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS
    );

    const initialVersion: ScheduleVersion = {
      versionNumber: 1,
      id: 'VER-1',
      createdAt: new Date().toISOString(),
      source: 'AI_INITIAL_PROPOSAL',
      status: 'Pending_Approval',
      assignments: baseline.assignments,
      unassignedRequestIds: baseline.unassignedRequestIds,
      summary: baseline.summary,
      tradeOffs: baseline.tradeOffs,
      risks: baseline.risks,
      suggestedQuestions: baseline.suggestedQuestions,
    };

    setAssignments(baseline.assignments);
    setUnassignedIds(baseline.unassignedRequestIds);
    setVersions([initialVersion]);
    setCurrentVersion(initialVersion);

    // Initial Audit Entry
    addAuditEntry(
      'PLAN_PROPOSED',
      'AI_AGENT',
      'Initial baseline dispatch plan v1 proposed by AI Agent',
      { assignedCount: baseline.assignments.length, unassignedCount: baseline.unassignedRequestIds.length }
    );
  }, []);

  // Audit Log Helper
  const addAuditEntry = (
    eventType: AuditLogEntry['eventType'],
    actor: AuditLogEntry['actor'],
    summary: string,
    details?: any
  ) => {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      actor,
      summary,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Notification Helper
  const addNotification = (
    recipient: string,
    recipientRole: MockNotification['recipientRole'],
    channel: MockNotification['channel'],
    subject: string,
    body: string
  ) => {
    const notif: MockNotification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      recipient,
      recipientRole,
      channel,
      subject,
      body,
      status: 'Delivered',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Run AI Planning / Replanning
  const handleRunAIPlanning = async (
    disruptionContext?: {
      type: 'TECHNICIAN_CANCELLATION' | 'EMERGENCY_REQUEST';
      cancelledTechnicianId?: string;
      emergencyRequestId?: string;
      reason: string;
    }
  ) => {
    setIsPlanning(true);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicians,
          requests,
          existingAssignments: assignments,
          preserveCompleted: true,
          disruptionContext,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        const nextVersionNum = (currentVersion?.versionNumber || 1) + 1;

        // Compute diff from current version
        const diff = computeScheduleDiff(
          assignments,
          data.plan.assignments,
          currentVersion?.versionNumber || 1,
          requests,
          technicians,
          disruptionContext?.reason
        );

        const newVersion: ScheduleVersion = {
          versionNumber: nextVersionNum,
          id: `VER-${nextVersionNum}`,
          createdAt: new Date().toISOString(),
          source: disruptionContext
            ? disruptionContext.type === 'EMERGENCY_REQUEST'
              ? 'REPLAN_EMERGENCY'
              : 'REPLAN_CANCELLATION'
            : 'AI_INITIAL_PROPOSAL',
          status: 'Pending_Approval',
          assignments: data.plan.assignments,
          unassignedRequestIds: data.plan.unassignedRequestIds,
          summary: data.plan.summary,
          tradeOffs: data.plan.tradeOffs,
          risks: data.plan.risks,
          suggestedQuestions: data.plan.suggestedQuestions,
          diffFromPrevious: diff,
        };

        setAssignments(data.plan.assignments);
        setUnassignedIds(data.plan.unassignedRequestIds);
        setVersions((prev) => [...prev, newVersion]);
        setCurrentVersion(newVersion);

        addAuditEntry(
          disruptionContext ? 'PLAN_REVISED' : 'PLAN_PROPOSED',
          'AI_AGENT',
          `AI Agent generated Schedule Proposal v${nextVersionNum} (${data.plan.source})`,
          { summary: data.plan.summary, tradeOffs: data.plan.tradeOffs }
        );

        setIsAssistantOpen(true);
      }
    } catch (err) {
      console.error('Failed to run AI planning:', err);
    } finally {
      setIsPlanning(false);
    }
  };

  // Dispatcher Approval Handler
  const handleApprovePlan = () => {
    if (!currentVersion) return;

    const approvedVersion: ScheduleVersion = {
      ...currentVersion,
      status: 'Approved',
      assignments: currentVersion.assignments.map((a) => ({
        ...a,
        status: a.status === 'Completed' ? 'Completed' : 'Approved',
      })),
    };

    setCurrentVersion(approvedVersion);
    setVersions((prev) =>
      prev.map((v) => (v.versionNumber === approvedVersion.versionNumber ? approvedVersion : v))
    );
    setAssignments(approvedVersion.assignments);

    // Audit Log
    addAuditEntry(
      'PLAN_APPROVED',
      'DISPATCHER',
      `Dispatcher formally approved Schedule Version v${approvedVersion.versionNumber}`,
      { assignmentCount: approvedVersion.assignments.length }
    );

    // Mock Notifications sent out
    technicians.forEach((t) => {
      const techJobs = approvedVersion.assignments.filter((a) => a.technicianId === t.id);
      if (techJobs.length > 0) {
        addNotification(
          t.name,
          'Technician',
          'SMS',
          `Shift Schedule Confirmed (v${approvedVersion.versionNumber})`,
          `Hi ${t.name}, your schedule for today has been locked with ${techJobs.length} work orders. First stop starts at ${techJobs[0].startTime}.`
        );
      }
    });

    // Notify customers
    approvedVersion.assignments.slice(0, 3).forEach((a) => {
      const req = requests.find((r) => r.id === a.requestId);
      const tech = technicians.find((t) => t.id === a.technicianId);
      if (req && tech) {
        addNotification(
          req.customer,
          'Customer',
          'SMS',
          `Service Appointment Confirmed (${req.id})`,
          `Your technician ${tech.name} is scheduled to arrive at ${req.address} between ${a.startTime} and ${a.endTime}.`
        );
      }
    });
  };

  // Reject / Discard Draft
  const handleRejectPlan = () => {
    if (!currentVersion || versions.length <= 1) return;
    const previousVersion = versions[versions.length - 2];
    setCurrentVersion(previousVersion);
    setAssignments(previousVersion.assignments);
    setUnassignedIds(previousVersion.unassignedRequestIds);

    addAuditEntry(
      'PLAN_PROPOSED',
      'DISPATCHER',
      `Dispatcher rejected draft v${currentVersion.versionNumber}, reverting to v${previousVersion.versionNumber}`
    );
  };

  // Simulate Technician Breakdown Disruption
  const handleSimulateTechDisruption = async () => {
    // Marcus Vance breakdown simulation
    const targetTechId = 'TECH-2';
    const updatedTechs = technicians.map((t) => {
      if (t.id === targetTechId) {
        return {
          ...t,
          status: 'Unavailable' as const,
          disruptionReason: 'Van transmission failure on I-95 at 11:30 AM',
        };
      }
      return t;
    });

    setTechnicians(updatedTechs);

    addAuditEntry(
      'TECHNICIAN_CANCELLED',
      'SYSTEM',
      `Technician Marcus Vance reported vehicle breakdown. Status set to Unavailable. Initiating dynamic replanning.`
    );

    addNotification(
      'Marcus Vance',
      'Technician',
      'Push Notification',
      'Shift Suspended',
      'Your shift has been suspended due to vehicle breakdown report. Stand by for fleet roadside assistance.'
    );

    // Trigger AI Replanner with disruption context
    await handleRunAIPlanning({
      type: 'TECHNICIAN_CANCELLATION',
      cancelledTechnicianId: targetTechId,
      reason: 'Marcus Vance van breakdown — remaining tickets must be redistributed.',
    });
  };

  // Simulate Emergency Work Order Disruption
  const handleSimulateEmergency = async () => {
    // Check if emergency request is already added
    if (requests.some((r) => r.id === EMERGENCY_SIMULATION_REQUEST.id)) {
      alert('Emergency request SR-999 is already in the system.');
      return;
    }

    const updatedRequests = [EMERGENCY_SIMULATION_REQUEST, ...requests];
    setRequests(updatedRequests);
    setUnassignedIds((prev) => [EMERGENCY_SIMULATION_REQUEST.id, ...prev]);

    addAuditEntry(
      'EMERGENCY_INJECTED',
      'SYSTEM',
      `CRITICAL DISRUPTION: Injected SR-999 (${EMERGENCY_SIMULATION_REQUEST.title}). Initiating high-priority replanning.`
    );

    addNotification(
      'Lead Dispatcher',
      'Dispatcher',
      'Push Notification',
      'CRITICAL WORK ORDER RECEIVED',
      'St. Jude Hospital reported ICU generator transfer switch fault. Immediate electrical technician required!'
    );

    // Trigger AI Replanner
    await handleRunAIPlanning({
      type: 'EMERGENCY_REQUEST',
      emergencyRequestId: EMERGENCY_SIMULATION_REQUEST.id,
      reason: 'Emergency ICU generator transfer switch failure at St. Jude Hospital.',
    });
  };

  // Reset Day
  const handleResetDay = () => {
    setTechnicians(INITIAL_TECHNICIANS);
    setRequests(INITIAL_SERVICE_REQUESTS);

    const baseline = solveScheduleDeterministically(
      INITIAL_TECHNICIANS,
      INITIAL_SERVICE_REQUESTS
    );

    const v1: ScheduleVersion = {
      versionNumber: 1,
      id: 'VER-1',
      createdAt: new Date().toISOString(),
      source: 'AI_INITIAL_PROPOSAL',
      status: 'Pending_Approval',
      assignments: baseline.assignments,
      unassignedRequestIds: baseline.unassignedRequestIds,
      summary: baseline.summary,
      tradeOffs: baseline.tradeOffs,
      risks: baseline.risks,
      suggestedQuestions: baseline.suggestedQuestions,
    };

    setAssignments(baseline.assignments);
    setUnassignedIds(baseline.unassignedRequestIds);
    setVersions([v1]);
    setCurrentVersion(v1);

    addAuditEntry('VERSION_RESTORED', 'DISPATCHER', 'Day reset to baseline initial scenario.');
  };

  // Manual Assignment Save
  const handleSaveManualAssignment = (
    updatedAssignment: ScheduleAssignment,
    overrideReason: string
  ) => {
    const existingIndex = assignments.findIndex(
      (a) => a.requestId === updatedAssignment.requestId
    );
    let newAssignments = [...assignments];

    if (existingIndex >= 0) {
      newAssignments[existingIndex] = updatedAssignment;
    } else {
      newAssignments.push(updatedAssignment);
    }

    const newUnassigned = requests
      .map((r) => r.id)
      .filter((id) => !newAssignments.some((a) => a.requestId === id));

    const nextVerNum = (currentVersion?.versionNumber || 1) + 1;
    const newVer: ScheduleVersion = {
      versionNumber: nextVerNum,
      id: `VER-${nextVerNum}`,
      createdAt: new Date().toISOString(),
      source: 'MANUAL_OVERRIDE',
      status: 'Approved',
      assignments: newAssignments,
      unassignedRequestIds: newUnassigned,
      summary: `Manual dispatcher override: ${overrideReason}`,
      tradeOffs: [`Dispatcher manually adjusted ticket ${updatedAssignment.requestId}`],
      risks: [],
      suggestedQuestions: [],
    };

    setAssignments(newAssignments);
    setUnassignedIds(newUnassigned);
    setVersions((prev) => [...prev, newVer]);
    setCurrentVersion(newVer);

    addAuditEntry(
      'MANUAL_OVERRIDE',
      'DISPATCHER',
      `Manual assignment saved for ${updatedAssignment.requestId} ➔ ${updatedAssignment.technicianId} (${updatedAssignment.startTime}–${updatedAssignment.endTime})`,
      { overrideReason }
    );
  };

  // Manual Unassign
  const handleUnassignAssignment = (assignmentId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return;

    const newAssignments = assignments.filter((a) => a.id !== assignmentId);
    const newUnassigned = [...unassignedIds, asg.requestId];

    setAssignments(newAssignments);
    setUnassignedIds(newUnassigned);

    addAuditEntry(
      'MANUAL_OVERRIDE',
      'DISPATCHER',
      `Dispatcher unassigned request ${asg.requestId} from ${asg.technicianId}`
    );
  };

  // Restore Version
  const handleRestoreVersion = (version: ScheduleVersion) => {
    setCurrentVersion(version);
    setAssignments(version.assignments);
    setUnassignedIds(version.unassignedRequestIds);

    addAuditEntry(
      'VERSION_RESTORED',
      'DISPATCHER',
      `Restored schedule to version v${version.versionNumber}`
    );
  };

  // Selection Handlers
  const handleSelectAssignment = (assignment: ScheduleAssignment) => {
    setSelectedAssignment(assignment);
    const req = requests.find((r) => r.id === assignment.requestId) || null;
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  const handleSelectQueueRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setSelectedAssignment(null);
    setIsDetailModalOpen(true);
  };

  const handleOpenManualAssign = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setSelectedAssignment(null);
    setIsManualModalOpen(true);
  };

  // Validation Check on Current Assignments
  const validation = validateSchedule(assignments, technicians, requests);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      {currentVersion && (
        <Header
          currentVersion={currentVersion}
          allVersions={versions}
          assignedCount={assignments.length}
          totalRequestsCount={requests.length}
          activeTechCount={technicians.filter((t) => t.status === 'Active').length}
          hasErrors={!validation.valid}
          onTriggerAIPlanning={() => handleRunAIPlanning()}
          onSimulateDisruption={handleSimulateTechDisruption}
          onSimulateEmergency={handleSimulateEmergency}
          onReset={handleResetDay}
          onOpenVersionHistory={() => setIsVersionModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditModalOpen(true)}
          onOpenNotifications={() => setIsNotifModalOpen(true)}
          notificationCount={notifications.length}
          auditCount={auditLogs.length}
          isPlanning={isPlanning}
        />
      )}

      {/* Human-in-the-Loop Approval Banner */}
      {currentVersion && (
        <ApprovalBanner
          version={currentVersion}
          onApprove={handleApprovePlan}
          onReject={handleRejectPlan}
          onViewRationale={() => setIsAssistantOpen(true)}
          hasErrors={!validation.valid}
        />
      )}

      {/* Validation Alert Banner if hard constraint violated */}
      {!validation.valid && (
        <div className="bg-rose-950/90 border-b border-rose-800 p-2.5 px-6 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Hard Constraint Violations Detected:</span>
            <span>{validation.errors[0]?.message}</span>
            {validation.errors.length > 1 && (
              <span className="opacity-75">
                (+{validation.errors.length - 1} more errors)
              </span>
            )}
          </div>
          <span className="text-[11px] underline cursor-pointer" onClick={() => setIsAssistantOpen(true)}>
            View details
          </span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col xl:flex-row gap-6 overflow-hidden">
        {/* Left Column: Interactive Timeline Board */}
        <section className="flex-1 flex flex-col min-h-[550px] overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Field Service Dispatch Board (Oct 9, 2026)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Emergency
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> Low
              </span>
            </div>
          </div>

          <div className="flex-1">
            <TimelineGrid
              technicians={technicians}
              requests={requests}
              assignments={assignments}
              onSelectAssignment={handleSelectAssignment}
              selectedAssignmentId={selectedAssignment?.id}
            />
          </div>
        </section>

        {/* Right Column: Unassigned Queue Tray */}
        <aside className="w-full xl:w-96 shrink-0 flex flex-col min-h-[400px]">
          <ServiceRequestQueue
            requests={requests}
            unassignedIds={unassignedIds}
            onSelectRequest={handleSelectQueueRequest}
            onOpenManualAssign={handleOpenManualAssign}
          />
        </aside>
      </main>

      {/* Drawers & Modals */}
      {currentVersion && (
        <AIAssistantDrawer
          version={currentVersion}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          onApprove={handleApprovePlan}
          hasErrors={!validation.valid}
        />
      )}

      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        versions={versions}
        currentVersionNumber={currentVersion?.versionNumber || 1}
        onRestoreVersion={handleRestoreVersion}
      />

      <AuditLogDrawer
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        entries={auditLogs}
      />

      <NotificationsDrawer
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
      />

      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
        assignment={selectedAssignment}
        technician={
          selectedAssignment
            ? technicians.find((t) => t.id === selectedAssignment.technicianId)
            : null
        }
        onEditAssignment={() => {
          setIsDetailModalOpen(false);
          setIsManualModalOpen(true);
        }}
      />

      <ManualAssignmentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        assignment={selectedAssignment}
        request={selectedRequest}
        technicians={technicians}
        requests={requests}
        allAssignments={assignments}
        onSave={handleSaveManualAssignment}
        onUnassign={handleUnassignAssignment}
      />
    </div>
  );
}
