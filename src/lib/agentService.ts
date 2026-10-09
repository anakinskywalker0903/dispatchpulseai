import Groq from 'groq-sdk';
import {
  Technician,
  ServiceRequest,
  ScheduleAssignment,
  AIPlanningResponse,
  AIPlanningRequest,
} from './types';
import { solveScheduleDeterministically } from './heuristicSolver';
import { validateSchedule } from './constraintEngine';

export async function generateDispatchPlan(
  payload: AIPlanningRequest
): Promise<AIPlanningResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  // If no Groq API key is configured, instantly run deterministic solver
  if (!apiKey || apiKey.trim() === '') {
    return solveScheduleDeterministically(
      payload.technicians,
      payload.requests,
      payload.existingAssignments,
      payload.preserveCompleted ?? true,
      payload.disruptionContext?.cancelledTechnicianId,
      payload.disruptionContext?.emergencyRequestId
    );
  }

  try {
    const groq = new Groq({ apiKey });

    // Prepare prompt context
    const completedAssignments = (payload.existingAssignments || []).filter(
      (a) => a.status === 'Completed' || a.locked
    );

    const activeTechnicians = payload.technicians.map((t) => ({
      id: t.id,
      name: t.name,
      skills: t.skills,
      region: t.assignedRegion,
      workingHours: `${t.workingHours.start}-${t.workingHours.end}`,
      lunchBreak: `${t.breakTime.start}-${t.breakTime.end}`,
      maxWorkloadMins: t.maxWorkloadMinutes,
      status: t.status,
    }));

    const requestsList = payload.requests.map((r) => ({
      id: r.id,
      title: r.title,
      customer: r.customer,
      region: r.region,
      requiredSkill: r.requiredSkill,
      priority: r.priority,
      durationMins: r.estimatedDuration,
      preferredWindow: r.preferredTimeWindow
        ? `${r.preferredTimeWindow.start}-${r.preferredTimeWindow.end}`
        : 'Flexible',
      status: r.status,
      missingInfo: r.missingInfoFlags || [],
    }));

    const systemPrompt = `You are DispatchPulse AI, an expert autonomous Field Service Dispatch and Replanning Agent.
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
Respond with ONLY a valid, raw JSON object (no markdown, no backticks, no preamble) conforming to this TypeScript interface:
{
  "assignments": [
    {
      "id": "ASG-<requestId>-<techId>",
      "requestId": "<requestId>",
      "technicianId": "<techId>",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "status": "Proposed",
      "locked": false
    }
  ],
  "unassignedRequestIds": ["<requestId>"],
  "summary": "<High-level executive summary of the schedule>",
  "tradeOffs": ["<Detailed explanation of trade-offs made, e.g. prioritizing emergency over low priority>"],
  "risks": ["<Identified risks like tight travel buffers or high technician workload>"],
  "suggestedQuestions": [
    {
      "requestId": "<requestId>",
      "customer": "<customer>",
      "question": "<clarification question to ask customer>",
      "rationale": "<why this info is needed>"
    }
  ],
  "reasoning": "<Summary of planning strategy and priority justification>"
}`;

    const userPrompt = JSON.stringify({
      technicians: activeTechnicians,
      requests: requestsList,
      completedLockedAssignments: completedAssignments,
      disruptionContext: payload.disruptionContext || null,
    });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent);

    // Validate proposed assignments deterministically
    const proposedAssignments: ScheduleAssignment[] = (parsed.assignments || []).map(
      (a: any) => ({
        id: a.id || `ASG-${a.requestId}-${a.technicianId}`,
        requestId: a.requestId,
        technicianId: a.technicianId,
        startTime: a.startTime,
        endTime: a.endTime,
        status: 'Proposed',
        locked: false,
      })
    );

    // Re-attach locked completed assignments
    for (const locked of completedAssignments) {
      if (!proposedAssignments.some((a) => a.requestId === locked.requestId)) {
        proposedAssignments.push(locked);
      }
    }

    const validation = validateSchedule(
      proposedAssignments,
      payload.technicians,
      payload.requests
    );

    // If LLM produced zero hard errors, use its proposal
    if (validation.valid) {
      return {
        assignments: proposedAssignments,
        unassignedRequestIds: parsed.unassignedRequestIds || [],
        summary: parsed.summary || 'AI Dispatch plan generated.',
        tradeOffs: parsed.tradeOffs || [],
        risks: parsed.risks || [],
        suggestedQuestions: parsed.suggestedQuestions || [],
        reasoning: parsed.reasoning || 'Optimized using Llama 3.3 70B on Groq.',
        source: 'GROQ_LLM',
      };
    } else {
      // If LLM made a deterministic error, fall back safely to heuristic solver
      console.warn(
        'LLM proposal had constraint violations. Falling back to deterministic solver:',
        validation.errors
      );
      const fallback = solveScheduleDeterministically(
        payload.technicians,
        payload.requests,
        payload.existingAssignments,
        payload.preserveCompleted ?? true,
        payload.disruptionContext?.cancelledTechnicianId,
        payload.disruptionContext?.emergencyRequestId
      );
      return {
        ...fallback,
        tradeOffs: [
          ...fallback.tradeOffs,
          `Deterministic safety net corrected ${validation.errors.length} constraint violation(s) from LLM proposal.`,
        ],
      };
    }
  } catch (error) {
    console.error('Groq agent call failed, falling back to deterministic heuristic solver:', error);
    return solveScheduleDeterministically(
      payload.technicians,
      payload.requests,
      payload.existingAssignments,
      payload.preserveCompleted ?? true,
      payload.disruptionContext?.cancelledTechnicianId,
      payload.disruptionContext?.emergencyRequestId
    );
  }
}
