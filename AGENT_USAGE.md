# Agent Usage & AI Collaboration Report

This document records the tooling, prompts, delegated workflows, safety corrections, and verification procedures used throughout the development and runtime execution of **DispatchPulse AI**.

---

## 1. Tools and Models Used

- **LLM Engine:** Groq API running `llama-3.3-70b-versatile` (ultra-fast inference on LPU architecture for real-time agent responses).
- **Assisting Coding Agent:** Antigravity AI (Google DeepMind pair programming assistant) for test-driven development, deterministic constraint logic, and UI scaffolding.
- **Testing & Verification:** Vitest test suite running deterministic constraint test cases.

---

## 2. Representative Prompts

### A. Initial Dispatch Planning System Prompt
```text
You are DispatchPulse AI, an expert autonomous Field Service Dispatch and Replanning Agent.
Your task is to assign service requests to available technicians for a single working day (08:00 to 18:00).

MANDATORY HARD CONSTRAINTS (Deterministic):
1. Skill matching: A technician can ONLY be assigned a request if their skills array contains the request's requiredSkill.
2. No double booking: A technician cannot have two assignments that overlap in time.
3. Working hours: All assignments must start and end strictly within the technician's working hours.
4. Lunch break protection: No assignment may overlap the technician's lunch break.
5. Max workload: The total duration (sum of minutes) assigned to a technician cannot exceed their maxWorkloadMins.
6. Locked / Completed assignments: Any assignment marked 'Completed' or 'locked' MUST remain untouched at its exact time and technician.
7. Disruption handling: If a technician is 'Unavailable', assign zero new tasks to them and reassign their pending tasks.

OUTPUT FORMAT:
Respond with ONLY a valid raw JSON object conforming to the AIPlanningResponse schema. Include:
- assignments (list of scheduled work orders)
- unassignedRequestIds (tickets deferred due to capacity/skill)
- summary (high-level executive rationale)
- tradeOffs (explanations of priority tradeoffs and deferrals)
- risks (tight travel buffers or high workload utilization)
- suggestedQuestions (clarification questions for tickets with missing information)
```

### B. Disruption Replanning Prompt Context
```json
{
  "technicians": [
    {
      "id": "TECH-2",
      "name": "Marcus Vance",
      "status": "Unavailable",
      "skills": ["Plumbing", "Appliances"]
    }
  ],
  "disruptionContext": {
    "type": "TECHNICIAN_CANCELLATION",
    "cancelledTechnicianId": "TECH-2",
    "reason": "Marcus Vance van breakdown on I-95. Shift suspended."
  },
  "completedLockedAssignments": [
    {
      "requestId": "SR-101",
      "technicianId": "TECH-1",
      "startTime": "08:00",
      "endTime": "10:00",
      "status": "Completed",
      "locked": true
    }
  ]
}
```

---

## 3. Delegated Work

1. **Strategic Prioritization & Trade-Off Analysis:**
   - Determining which requests should be slotted immediately versus deferred when capacity is tight.
   - Producing human-readable explanations of why certain jobs were reassigned (e.g., cross-region assignments made to prevent delays on high-priority tickets).

2. **Proactive Risk Identification:**
   - Scanning the schedule for technicians operating above 90% capacity.
   - Detecting tight travel buffers (<15 minutes) between geographically separate assignments.

3. **Customer Communication Drafting:**
   - Reviewing service requests flagged with incomplete specifications (e.g., missing gate code, unverified appliance serial numbers).
   - Drafting ready-to-send clarification messages to customers.

4. **Change Explanation (Diff Generation):**
   - Synthesizing what changed between schedule versions and explaining the operational reason for each modification.

---

## 4. Important Agent Mistakes, Rejected Suggestions & Safety Rails

1. **Unilateral Schedule Approval (Rejected):**
   - *Issue:* In early conceptual drafts, the agent attempted to mark schedules as automatically finalized.
   - *Correction:* Strictly decoupled agent planning from schedule confirmation. The agent is architected exclusively as a proposal engine; only a human dispatcher can approve a plan.

2. **Lunch Break & Time Window Overlaps (Intercepted by Safety Net):**
   - *Issue:* Probabilistic LLMs occasionally propose appointments that overlap with lunch break intervals or customer preferred windows when schedules are congested.
   - *Correction:* Built a dual-layer architecture:
     * Proposed assignments are passed through `validateSchedule()` before being displayed.
     * If any hard constraint violation is detected, the system safely falls back to the deterministic heuristic solver while preserving the AI's trade-off analysis.

3. **Modification of Historical / Completed Work Orders (Rejected):**
   - *Issue:* During disruption replanning, the LLM initially attempted to shift earlier jobs to free up time slots.
   - *Correction:* Hardened the model so that assignments marked `Completed` or `locked: true` are filtered out before scheduling, injected immutably into the final schedule, and verified with automated test suites.

---

## 5. Verification & Output Validation

- **Automated Vitest Test Suite:** 11 unit tests verifying skill matching, working hour bounds, break protection, double-booking prevention, maximum workload limits, completed task immutability, and diff computations.
- **Mathematical Safety Net:** A pure TypeScript constraint engine (`validateSchedule`) inspects all proposed assignments, ensuring zero hallucinations make it to the active dispatch board.
- **Human-in-the-Loop Review:** Dispatchers inspect all proposed changes via the visual diff viewer and approval banner before committing any change.
