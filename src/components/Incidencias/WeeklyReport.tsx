import React, { useEffect, useMemo, useState } from 'react';
import { getAllAttendance, getJustifiedAbsences } from '../../services/attendanceApiService';
import { getAllEvents } from '../../services/eventService';
import type { AttendanceRecord, AttendanceEmployee } from '../../types/Attendance';
import { startOfWeek, endOfWeek, addDays } from '../../utils/weekUtils';
import {
  STATUS,
  StatusKey,
  localDateKey,
  classifyDay,
  getBranchSchedule,
  groupRecordsByEmployeeDay,
} from '../../utils/attendanceStatus';
import { useAuth } from '../../contexts/AuthContext';
import JustifyAbsenceModal from './JustifyAbsenceModal';

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
  /** Branch name used to match this restaurant's "holiday" calendar events. */
  branchName?: string | null;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({
  restaurantId,
  employees,
  weekStart,
  onWeekChange,
  refreshKey = 0,
  branchName = null,
}) => {
  const { isAdmin, isGerente } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyWithRecords, setOnlyWithRecords] = useState(false);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [justifiedDates, setJustifiedDates] = useState<Set<string>>(new Set());
  const [justifyTarget, setJustifyTarget] = useState<{
    employeeId: number;
    employeeName: string;
    date: string;
  } | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    getAllEvents()
      .then((events) => {
        if (cancelled) return;
        const dates = new Set<string>();
        for (const event of events) {
          if (event.type !== 'holiday') continue;
          if (event.targetBranch && event.targetBranch !== branchName) continue;
          dates.add(localDateKey(event.date));
        }
        setHolidayDates(dates);
      })
      .catch(() => {
        // non-critical; grid falls back to no holiday-awareness
      });
    return () => {
      cancelled = true;
    };
  }, [branchName]);

  useEffect(() => {
    const start = new Date(weekStartMs);
    let cancelled = false;
    getJustifiedAbsences(restaurantId, {
      startDate: localDateKey(start),
      endDate: localDateKey(endOfWeek(start)),
    })
      .then((list) => {
        if (cancelled) return;
        setJustifiedDates(new Set(list.map((j) => `${j.employeeId}:${j.date}`)));
      })
      .catch(() => {
        // non-critical; cells fall back to unjustified until reloaded
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, weekStartMs, refreshKey]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStartMs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const byEmployeeDay = useMemo(() => groupRecordsByEmployeeDay(records), [records]);

  const schedule = useMemo(() => getBranchSchedule(branchName), [branchName]);

  const displayName = (emp: AttendanceEmployee) => emp.linkedUser?.displayName || emp.name;

  const rows = useMemo(() => {
    const active = employees
      .filter((e) => e.isActive && e.linkedUser)
      .sort((a, b) => a.sortOrder - b.sortOrder || displayName(a).localeCompare(displayName(b)));
    if (!onlyWithRecords) return active;
    return active.filter((e) => (byEmployeeDay.get(e.id)?.size ?? 0) > 0);
  }, [employees, byEmployeeDay, onlyWithRecords]);

  const todayKey = localDateKey(new Date());

  function renderDayCell(emp: AttendanceEmployee, day: Date) {
    const dateKey = localDateKey(day);
    const recs = byEmployeeDay.get(emp.id)?.get(dateKey) ?? [];
    const timeRange =
      recs.length === 1
        ? formatTime(recs[0].checkedAt)
        : recs.length > 1
          ? `${formatTime(recs[0].checkedAt)} - ${formatTime(recs[recs.length - 1].checkedAt)}`
          : '';

    const status = classifyDay({
      recs,
      dateKey,
      todayKey,
      isHoliday: holidayDates.has(dateKey),
      restDayNames: emp.linkedUser?.restDays,
      jsDay: day.getDay(),
      isJustified: justifiedDates.has(`${emp.id}:${dateKey}`),
      schedule,
    });

    if (status === 'future') {
      return <td key={dateKey} className="py-2 px-2 text-center bg-gray-50" />;
    }

    const clickable = (isAdmin || isGerente) && status === 'faltaInjustificada';
    const { className } = STATUS[status];

    return (
      <td
        key={dateKey}
        className={`py-2 px-2 text-center whitespace-nowrap ${className} ${
          clickable ? 'cursor-pointer hover:ring-2 hover:ring-red-400' : ''
        }`}
        onClick={
          clickable
            ? () =>
                setJustifyTarget({
                  employeeId: emp.id,
                  employeeName: displayName(emp),
                  date: dateKey,
                })
            : undefined
        }
      >
        {timeRange}
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

      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-xs text-gray-600">
        {(Object.keys(STATUS) as StatusKey[]).map((key) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-sm border border-gray-300 ${STATUS[key].className.split(' ')[0]}`}
            />
            <span>{STATUS[key].label}</span>
          </div>
        ))}
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
                  <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">
                    {displayName(emp)}
                  </td>
                  <td className="py-2 pr-4 text-gray-500 text-center whitespace-nowrap">
                    {emp.linkedUser?.restDays?.length ? emp.linkedUser.restDays.join(', ') : '—'}
                  </td>
                  {weekDays.map((day) => renderDayCell(emp, day))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {justifyTarget && (
        <JustifyAbsenceModal
          restaurantId={restaurantId}
          employeeId={justifyTarget.employeeId}
          employeeName={justifyTarget.employeeName}
          date={justifyTarget.date}
          onClose={() => setJustifyTarget(null)}
          onConfirmed={() => {
            setJustifiedDates((prev) => {
              const next = new Set(prev);
              next.add(`${justifyTarget.employeeId}:${justifyTarget.date}`);
              return next;
            });
            setJustifyTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default WeeklyReport;
