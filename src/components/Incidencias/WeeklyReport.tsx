import React, { useEffect, useMemo, useState } from 'react';
import { getAllAttendance } from '../../services/attendanceApiService';
import type { AttendanceRecord, AttendanceEmployee } from '../../types/Attendance';
import { startOfWeek, endOfWeek, addDays } from '../../utils/weekUtils';

/** Local calendar date as YYYY-MM-DD — same technique the old groupByDay used. */
function localDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

function formatTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase()
    .replace(' ', '');
}

function weekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  return `${fmt(weekStart)} – ${fmt(end)} ${end.getFullYear()}`;
}

const WEEKS_BACK = 16;
const DAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// ─── Component ───────────────────────────────────────────────────────────────

interface WeeklyReportProps {
  restaurantId: number;
  employees: AttendanceEmployee[];
  weekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  /** Bump to force a refetch (e.g. after a device sync). */
  refreshKey?: number;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({
  restaurantId,
  employees,
  weekStart,
  onWeekChange,
  refreshKey = 0,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyWithRecords, setOnlyWithRecords] = useState(false);

  const weekStartMs = weekStart.getTime();

  const weekOptions = useMemo(() => {
    const current = startOfWeek(new Date());
    return Array.from({ length: WEEKS_BACK }, (_, i) => addDays(current, -7 * i));
  }, []);

  useEffect(() => {
    const start = new Date(weekStartMs);
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllAttendance(restaurantId, {
      startDate: start.toISOString(),
      endDate: endOfWeek(start).toISOString(),
    })
      .then((data) => {
        if (!cancelled) setRecords(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar registros');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, weekStartMs, refreshKey]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStartMs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // employeeId → local date (YYYY-MM-DD) → punches of that day, sorted
  const byEmployeeDay = useMemo(() => {
    const map = new Map<number, Map<string, AttendanceRecord[]>>();
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
  }, [records]);

  const rows = useMemo(() => {
    const active = employees
      .filter((e) => e.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!onlyWithRecords) return active;
    return active.filter((e) => (byEmployeeDay.get(e.id)?.size ?? 0) > 0);
  }, [employees, byEmployeeDay, onlyWithRecords]);

  const todayKey = localDateKey(new Date());

  function renderDayCell(employeeId: number, day: Date) {
    const dateKey = localDateKey(day);
    const recs = byEmployeeDay.get(employeeId)?.get(dateKey) ?? [];

    if (recs.length === 0) {
      // A day that hasn't happened yet is not an absence
      if (dateKey > todayKey) {
        return <td key={dateKey} className="py-2 px-2 text-center bg-gray-50" />;
      }
      return <td key={dateKey} className="py-2 px-2 text-center bg-red-100" />;
    }

    if (recs.length === 1) {
      return (
        <td key={dateKey} className="py-2 px-2 text-center bg-orange-100 text-orange-800 whitespace-nowrap">
          {formatTime(recs[0].checkedAt)}
        </td>
      );
    }

    return (
      <td key={dateKey} className="py-2 px-2 text-center text-gray-700 whitespace-nowrap">
        {formatTime(recs[0].checkedAt)} - {formatTime(recs[recs.length - 1].checkedAt)}
      </td>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-brand-primary">Reporte Semanal</h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={onlyWithRecords}
              onChange={(e) => setOnlyWithRecords(e.target.checked)}
            />
            Solo empleados con registros
          </label>
          <select
            className="input"
            value={weekStartMs}
            onChange={(e) => onWeekChange(new Date(Number(e.target.value)))}
          >
            {weekOptions.map((w, i) => (
              <option key={w.getTime()} value={w.getTime()}>
                {weekLabel(w)}{i === 0 ? ' (actual)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 pr-4 font-semibold text-gray-600">Nombre</th>
              <th className="pb-3 pr-4 font-semibold text-gray-600 whitespace-nowrap">Día descanso</th>
              {DAY_HEADERS.map((letter, i) => (
                <th key={i} className="pb-3 px-2 font-semibold text-gray-600 text-center">
                  <div>{letter}</div>
                  <div className="text-xs font-normal text-gray-400">{weekDays[i].getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="py-3 px-2">
                      <div className="animate-pulse bg-gray-200 rounded h-4 w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-gray-400">
                  No hay empleados que mostrar para esta semana.
                </td>
              </tr>
            ) : (
              rows.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">{emp.name}</td>
                  <td className="py-2 pr-4 text-gray-400 text-center">—</td>
                  {weekDays.map((day) => renderDayCell(emp.id, day))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyReport;
