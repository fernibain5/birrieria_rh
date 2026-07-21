/** Local calendar date as YYYY-MM-DD — same technique the old groupByDay used. */
export function localDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

/** Minutes since local midnight, e.g. 7:30am → 450. */
export function minutesSinceMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

// ─── Attendance statuses ─────────────────────────────────────────────────────
// Each branch has its own shift start / retardo cutoff, but shares the same
// shift end. "Descanso" is assigned when the day matches one of the linked
// user's restDays. "Vacaciones" has no data source yet — it's shown in the
// legend but never assigned by classifyDay.

export interface BranchSchedule {
  shiftStart: number; // on time through this minute-of-day (inclusive)
  lateThreshold: number; // retardo through this minute-of-day (inclusive); later is falta
  shiftEnd: number; // checkout before this minute-of-day is horarioIncompleto
}

const SAN_PEDRO_SCHEDULE: BranchSchedule = {
  shiftStart: 7 * 60, // 7:00am
  lateThreshold: 7 * 60 + 30, // 7:30am
  shiftEnd: 15 * 60, // 3:00pm
};

const LAS_QUINTAS_SCHEDULE: BranchSchedule = {
  shiftStart: 7 * 60 + 30, // 7:30am
  lateThreshold: 7 * 60 + 45, // 7:45am
  shiftEnd: 15 * 60, // 3:00pm
};

const BRANCH_SCHEDULES: Record<string, BranchSchedule> = {
  'San Pedro': SAN_PEDRO_SCHEDULE,
  'Las Quintas': LAS_QUINTAS_SCHEDULE,
};

/** Falls back to the San Pedro schedule if branchName is missing/unrecognized. */
export function getBranchSchedule(branchName: string | null | undefined): BranchSchedule {
  return (branchName && BRANCH_SCHEDULES[branchName]) || SAN_PEDRO_SCHEDULE;
}

export type StatusKey =
  | 'asistencia'
  | 'retardo'
  | 'faltaJustificada'
  | 'faltaInjustificada'
  | 'vacaciones'
  | 'diaInhabilNoLaborado'
  | 'diaInhabilLaborado'
  | 'horarioIncompleto'
  | 'descanso';

export const STATUS: Record<StatusKey, { label: string; className: string }> = {
  asistencia: { label: 'Asistencia', className: 'bg-green-100 text-green-800' },
  retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800' },
  faltaJustificada: { label: 'Falta justificada', className: 'bg-orange-100 text-orange-800' },
  faltaInjustificada: { label: 'Falta injustificada', className: 'bg-red-100 text-red-800' },
  vacaciones: { label: 'Vacaciones', className: 'bg-blue-100 text-blue-800' },
  diaInhabilNoLaborado: { label: 'Día inhábil no laborado', className: 'bg-brand-primarySoft text-brand-primaryMuted' },
  diaInhabilLaborado: { label: 'Día inhábil laborado', className: 'bg-green-200 text-green-900' },
  horarioIncompleto: { label: 'Horario incompleto', className: 'bg-purple-100 text-purple-800' },
  descanso: { label: 'Descanso', className: '' },
};

/** Indexed by Date#getDay() (0 = Sunday .. 6 = Saturday) — matches DIAS_DESCANSO's Spanish names. */
export const DIA_BY_JS_DAY = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Classifies a single employee-day into a status, given its punches and
 * context. Mirrors the exact branch order used everywhere this is checked:
 * holiday → future → rest day → falta → time-based punch classification.
 */
export function classifyDay(params: {
  recs: Array<{ checkedAt: string }>; // sorted ascending
  dateKey: string;
  todayKey: string;
  isHoliday: boolean;
  restDayNames: string[] | null | undefined;
  jsDay: number; // Date#getDay()
  isJustified: boolean;
  schedule: BranchSchedule;
}): StatusKey | 'future' {
  const { recs, dateKey, todayKey, isHoliday, restDayNames, jsDay, isJustified, schedule } = params;

  if (isHoliday) {
    return recs.length > 0 ? 'diaInhabilLaborado' : 'diaInhabilNoLaborado';
  }
  if (recs.length === 0) {
    // A day that hasn't happened yet is not an absence
    if (dateKey > todayKey) return 'future';
    // One of the employee's scheduled rest days is not an absence either
    if (restDayNames?.includes(DIA_BY_JS_DAY[jsDay])) return 'descanso';
    return isJustified ? 'faltaJustificada' : 'faltaInjustificada';
  }

  const firstMinutes = minutesSinceMidnight(recs[0].checkedAt);
  const lastMinutes = minutesSinceMidnight(recs[recs.length - 1].checkedAt);

  if (firstMinutes > schedule.lateThreshold) {
    return isJustified ? 'faltaJustificada' : 'faltaInjustificada';
  }
  if (firstMinutes > schedule.shiftStart) {
    // Between shiftStart and lateThreshold (exclusive/inclusive, checked above)
    return 'retardo';
  }
  if (lastMinutes < schedule.shiftEnd) {
    return 'horarioIncompleto';
  }
  return 'asistencia';
}

/** employeeId → local date (YYYY-MM-DD) → punches of that day, sorted ascending. */
export function groupRecordsByEmployeeDay<T extends { employeeId: number; checkedAt: string }>(
  records: T[],
): Map<number, Map<string, T[]>> {
  const map = new Map<number, Map<string, T[]>>();
  for (const r of records) {
    const dateKey = localDateKey(new Date(r.checkedAt));
    let days = map.get(r.employeeId);
    if (!days) map.set(r.employeeId, (days = new Map()));
    let recs = days.get(dateKey);
    if (!recs) days.set(dateKey, (recs = []));
    recs.push(r);
  }
  for (const days of map.values()) {
    for (const recs of days.values()) {
      recs.sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime());
    }
  }
  return map;
}
