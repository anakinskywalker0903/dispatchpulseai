export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function intervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  // Strictly overlapping: start of one is before end of another, and end of one is after start of another
  return aStart < bEnd && bStart < aEnd;
}

export function isWithinWindow(
  innerStart: string,
  innerEnd: string,
  outerStart: string,
  outerEnd: string
): boolean {
  const inS = timeToMinutes(innerStart);
  const inE = timeToMinutes(innerEnd);
  const outS = timeToMinutes(outerStart);
  const outE = timeToMinutes(outerEnd);
  return inS >= outS && inE <= outE;
}

export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  return minutesToTime(timeToMinutes(timeStr) + minutesToAdd);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTimeSlot(start: string, end: string): string {
  return `${start} – ${end}`;
}
