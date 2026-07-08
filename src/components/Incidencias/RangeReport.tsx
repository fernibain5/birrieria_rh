import React from 'react';
import { endOfDay } from 'date-fns';
import type { AttendanceEmployee } from '../../types/Attendance';
import { localDateKey } from '../../utils/attendanceStatus';
import AttendanceRangeTable from './AttendanceRangeTable';

/** Parses a native <input type="date"> value ("YYYY-MM-DD") as local midnight. */
function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface RangeReportProps {
  restaurantId: number;
  employees: AttendanceEmployee[];
  rangeStart: Date;
  rangeEnd: Date;
  onRangeChange: (rangeStart: Date, rangeEnd: Date) => void;
  /** Bump to force a refetch (e.g. after a device sync). */
  refreshKey?: number;
  /** Branch name used to match this restaurant's "holiday" calendar events. */
  branchName?: string | null;
}

const RangeReport: React.FC<RangeReportProps> = ({
  restaurantId,
  employees,
  rangeStart,
  rangeEnd,
  onRangeChange,
  refreshKey = 0,
  branchName = null,
}) => {
  const isValidRange = rangeStart.getTime() <= rangeEnd.getTime();

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-brand-primary">Reporte por Rango</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Desde
            <input
              type="date"
              className="input"
              value={localDateKey(rangeStart)}
              onChange={(e) => onRangeChange(parseDateInput(e.target.value), rangeEnd)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Hasta
            <input
              type="date"
              className="input"
              value={localDateKey(rangeEnd)}
              onChange={(e) => onRangeChange(rangeStart, endOfDay(parseDateInput(e.target.value)))}
            />
          </label>
        </div>
      </div>

      {!isValidRange ? (
        <p className="text-red-600 text-sm">La fecha "Desde" no puede ser posterior a "Hasta".</p>
      ) : (
        <AttendanceRangeTable
          restaurantId={restaurantId}
          employees={employees}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          refreshKey={refreshKey}
          branchName={branchName}
          emptyLabel="este rango"
        />
      )}
    </div>
  );
};

export default RangeReport;
