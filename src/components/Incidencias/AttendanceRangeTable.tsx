import React, { useEffect, useMemo, useState } from 'react';
import { eachDayOfInterval } from 'date-fns';
import { getAllAttendance, getJustifiedAbsences } from '../../services/attendanceApiService';
import { getAllEvents } from '../../services/eventService';
import type { AttendanceEmployee } from '../../types/Attendance';
import {
  localDateKey,
  classifyDay,
  getBranchSchedule,
  groupRecordsByEmployeeDay,
} from '../../utils/attendanceStatus';

interface RangeCounters {
  retardos: number;
  faltasInjustificadas: number;
  faltasJustificadas: number;
  diasTrabajados: number;
  descansos: number;
}

function emptyCounters(): RangeCounters {
  return { retardos: 0, faltasInjustificadas: 0, faltasJustificadas: 0, diasTrabajados: 0, descansos: 0 };
}

/**
 * Shared table for the Mensual / por Rango / Anual reports: fetches
 * attendance + justified absences + holidays for [rangeStart, rangeEnd]
 * (inclusive, local calendar days), then aggregates each employee's days
 * using the exact same classification rules as the weekly grid.
 */
interface AttendanceRangeTableProps {
  restaurantId: number;
  employees: AttendanceEmployee[];
  rangeStart: Date;
  rangeEnd: Date;
  /** Bump to force a refetch (e.g. after a device sync). */
  refreshKey?: number;
  /** Branch name used to match this restaurant's "holiday" calendar events. */
  branchName?: string | null;
  /** Shown in the empty state, e.g. "este mes" / "este rango" / "este año". */
  emptyLabel?: string;
}

const AttendanceRangeTable: React.FC<AttendanceRangeTableProps> = ({
  restaurantId,
  employees,
  rangeStart,
  rangeEnd,
  refreshKey = 0,
  branchName = null,
  emptyLabel = 'este período',
}) => {
  const [records, setRecords] = useState<{ employeeId: number; checkedAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [justifiedDates, setJustifiedDates] = useState<Set<string>>(new Set());

  const rangeStartMs = rangeStart.getTime();
  const rangeEndMs = rangeEnd.getTime();

  useEffect(() => {
    const start = new Date(rangeStartMs);
    const end = new Date(rangeEndMs);
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllAttendance(restaurantId, {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
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
  }, [restaurantId, rangeStartMs, rangeEndMs, refreshKey]);

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
    const start = new Date(rangeStartMs);
    const end = new Date(rangeEndMs);
    let cancelled = false;
    getJustifiedAbsences(restaurantId, {
      startDate: localDateKey(start),
      endDate: localDateKey(end),
    })
      .then((list) => {
        if (cancelled) return;
        setJustifiedDates(new Set(list.map((j) => `${j.employeeId}:${j.date}`)));
      })
      .catch(() => {
        // non-critical; counts fall back to unjustified until reloaded
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, rangeStartMs, rangeEndMs, refreshKey]);

  const byEmployeeDay = useMemo(() => groupRecordsByEmployeeDay(records), [records]);

  const schedule = useMemo(() => getBranchSchedule(branchName), [branchName]);

  const displayName = (emp: AttendanceEmployee) => emp.linkedUser?.displayName || emp.name;

  const daysInRange = useMemo(
    () => eachDayOfInterval({ start: new Date(rangeStartMs), end: new Date(rangeEndMs) }),
    [rangeStartMs, rangeEndMs],
  );

  const todayKey = localDateKey(new Date());

  const rows = useMemo(() => {
    const active = employees
      .filter((e) => e.isActive && e.linkedUser)
      .sort((a, b) => a.sortOrder - b.sortOrder || displayName(a).localeCompare(displayName(b)));

    return active.map((emp) => {
      const counters = emptyCounters();
      for (const day of daysInRange) {
        const dateKey = localDateKey(day);
        if (dateKey > todayKey) continue; // future days excluded entirely
        if (holidayDates.has(dateKey)) continue; // holidays excluded entirely

        const recs = byEmployeeDay.get(emp.id)?.get(dateKey) ?? [];
        const status = classifyDay({
          recs,
          dateKey,
          todayKey,
          isHoliday: false,
          restDayNames: emp.linkedUser?.restDays,
          jsDay: day.getDay(),
          isJustified: justifiedDates.has(`${emp.id}:${dateKey}`),
          schedule,
        });

        switch (status) {
          case 'asistencia':
            counters.diasTrabajados++;
            break;
          case 'retardo':
            counters.retardos++;
            counters.diasTrabajados++;
            break;
          case 'horarioIncompleto':
            counters.diasTrabajados++;
            break;
          case 'faltaInjustificada':
            counters.faltasInjustificadas++;
            break;
          case 'faltaJustificada':
            counters.faltasJustificadas++;
            break;
          case 'descanso':
            counters.descansos++;
            break;
          // 'future' can't occur (already skipped above); diaInhabil* can't
          // occur (isHoliday is forced false — holidays are skipped above).
        }
      }
      return { emp, counters };
    });
  }, [employees, daysInRange, byEmployeeDay, holidayDates, justifiedDates, todayKey, schedule]);

  return (
    <>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 pr-4 font-semibold text-gray-600">Nombre</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center">Retardos</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center">Faltas Injustificadas</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center">Faltas Justificadas</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center">Días trabajados</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center">Descansos</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-3 px-2">
                      <div className="animate-pulse bg-gray-200 rounded h-4 w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No hay empleados que mostrar para {emptyLabel}.
                </td>
              </tr>
            ) : (
              rows.map(({ emp, counters }) => (
                <tr key={emp.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">
                    {displayName(emp)}
                  </td>
                  <td className="py-2 px-2 text-center">{counters.retardos}</td>
                  <td className="py-2 px-2 text-center">{counters.faltasInjustificadas}</td>
                  <td className="py-2 px-2 text-center">{counters.faltasJustificadas}</td>
                  <td className="py-2 px-2 text-center">{counters.diasTrabajados}</td>
                  <td className="py-2 px-2 text-center">{counters.descansos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AttendanceRangeTable;
