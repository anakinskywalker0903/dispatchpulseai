import { NextRequest, NextResponse } from 'next/server';
import { validateSchedule } from '@/lib/constraintEngine';
import { ScheduleAssignment, Technician, ServiceRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { assignments, technicians, requests } = (await req.json()) as {
      assignments: ScheduleAssignment[];
      technicians: Technician[];
      requests: ServiceRequest[];
    };

    if (!assignments || !technicians || !requests) {
      return NextResponse.json(
        { error: 'assignments, technicians, and requests are required' },
        { status: 400 }
      );
    }

    const validation = validateSchedule(assignments, technicians, requests);
    return NextResponse.json(validation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
