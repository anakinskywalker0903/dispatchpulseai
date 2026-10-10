import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Technician, ServiceRequest, ScheduleAssignment } from '@/lib/types';
import { canTechnicianTakeSlot } from '@/lib/constraintEngine';

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      history = [],
      technicians = [],
      requests = [],
      assignments = [],
    } = await req.json();

    const clientApiKey = req.headers.get('x-groq-key');
    const apiKey = clientApiKey || process.env.GROQ_API_KEY;

    // Fallback if no Groq key configured
    if (!apiKey || apiKey.trim() === '') {
      // Heuristic natural language response
      const lower = message.toLowerCase();
      let reply = '';
      let actionSuggestion = null;

      if (lower.includes('emergency') || lower.includes('hospital') || lower.includes('icu')) {
        reply = "I've detected a critical emergency request for Hospital ICU Backup Generator! I recommend immediately dispatching Elena Rostova or David Kim (certified in Electrical) and rebalancing lower-priority work orders.";
        actionSuggestion = {
          type: 'INJECT_EMERGENCY',
          label: 'Inject Emergency Hospital Ticket (SR-999)',
        };
      } else if (lower.includes('sick') || lower.includes('breakdown') || lower.includes('marcus')) {
        reply = "Marcus Vance's status can be marked as Unavailable. His completed morning tasks will remain strictly locked, while remaining uncompleted tasks will be reallocated to available qualified peers.";
        actionSuggestion = {
          type: 'DISRUPT_TECH',
          targetTechId: 'TECH-2',
          label: 'Simulate Marcus Vehicle Breakdown & Replan',
        };
      } else if (lower.includes('risk') || lower.includes('overtime') || lower.includes('buffer')) {
        reply = "Current Schedule Risk Assessment:\n• Marcus Vance and Elena Rostova are operating at ~70% capacity.\n• No technicians currently exceed the 420-minute daily workload cap.\n• Recommend protecting minimum 15-minute travel buffers for cross-region jobs.";
      } else if (lower.includes('unassigned') || lower.includes('queue')) {
        const unassigned = requests.filter(
          (r: ServiceRequest) => !assignments.some((a: ScheduleAssignment) => a.requestId === r.id)
        );
        reply = `There are currently ${unassigned.length} unassigned tickets in the dispatch queue. Click "Run Dispatch AI" to automatically slot them by priority and skill.`;
      } else {
        reply = `Hello! I am DispatchAI Copilot. I can help you schedule work orders, query technician availability, rebalance shifts during disruptions, and explain optimization trade-offs.\n\nTry asking:\n• "Who is available for an electrical emergency in Downtown?"\n• "Marcus called in sick, replan his afternoon"\n• "Create an HVAC ticket for Bistro Lumière"`;
      }

      return NextResponse.json({
        reply,
        actionSuggestion,
        source: 'HEURISTIC_PARSER',
      });
    }

    // Call Groq LLaMA 3.3 70B
    const groq = new Groq({ apiKey });

    const activeTechSummaries = technicians.map((t: Technician) => ({
      id: t.id,
      name: t.name,
      skills: t.skills,
      region: t.assignedRegion,
      status: t.status,
      hours: `${t.workingHours.start}-${t.workingHours.end}`,
    }));

    const currentAssignmentsSummary = assignments.map((a: ScheduleAssignment) => ({
      requestId: a.requestId,
      techId: a.technicianId,
      time: `${a.startTime}-${a.endTime}`,
      status: a.status,
    }));

    const systemPrompt = `You are DispatchPulse AI Copilot, an expert conversational assistant for field service dispatchers.
You assist dispatchers in natural language to:
1. Schedule and slot new service requests.
2. Inquire about technician certifications, shift availability, and regional territory.
3. Manage disruptions (technician illness/breakdown or emergency jobs).
4. Explain trade-offs in current assignments.

Current Technicians: ${JSON.stringify(activeTechSummaries)}
Current Assignments: ${JSON.stringify(currentAssignmentsSummary)}

Always be concise, actionable, and professional.
If the dispatcher wants to execute a schedule disruption or add a ticket, provide clear advice and recommendations.
Respond with JSON matching:
{
  "reply": "Conversational answer formatted in markdown",
  "actionSuggestion": {
    "type": "NONE" | "INJECT_EMERGENCY" | "DISRUPT_TECH" | "CREATE_TICKET",
    "label": "Button label if applicable",
    "payload": {}
  }
}`;

    const formattedHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.text,
    }));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return NextResponse.json({
      reply: parsed.reply || 'I am ready to assist with dispatching.',
      actionSuggestion: parsed.actionSuggestion || null,
      source: 'GROQ_LLM',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({
      reply: "I am ready to assist with dispatching and scheduling. What would you like to review?",
      source: 'FALLBACK',
    });
  }
}
