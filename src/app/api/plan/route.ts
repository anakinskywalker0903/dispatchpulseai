import { NextRequest, NextResponse } from 'next/server';
import { generateDispatchPlan } from '@/lib/agentService';
import { validateSchedule } from '@/lib/constraintEngine';
import { AIPlanningRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: AIPlanningRequest = await req.json();

    if (!body.technicians || !body.requests) {
      return NextResponse.json(
        { error: 'Technicians and requests are required' },
        { status: 400 }
      );
    }

    const clientApiKey = req.headers.get('x-groq-key') || undefined;
    const plan = await generateDispatchPlan(body, clientApiKey);
    const validation = validateSchedule(plan.assignments, body.technicians, body.requests);

    return NextResponse.json({
      success: true,
      plan,
      validation,
    });
  } catch (error: any) {
    console.error('API /api/plan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while generating dispatch plan',
      },
      { status: 500 }
    );
  }
}
