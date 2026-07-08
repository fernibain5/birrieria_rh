import React, { useMemo } from 'react';
import { startOfYear, endOfYear, addYears, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttendanceEmployee } from '../../types/Attendance';
import AttendanceRangeTable from './AttendanceRangeTable';

const YEARS_BACK = 5;

interface AnnualReportProps {
  restaurantId: number;
  employees: AttendanceEmployee[];
  yearStart: Date;
  onYearChange: (yearStart: Date) => void;
  /** Bump to force a refetch (e.g. after a device sync). */
  refreshKey?: number;
  /** Branch name used to match this restaurant's "holiday" calendar events. */
  branchName?: string | null;
}

const AnnualReport: React.FC<AnnualReportProps> = ({
  restaurantId,
  employees,
  yearStart,
  onYearChange,
  refreshKey = 0,
  branchName = null,
}) => {
  const yearStartMs = yearStart.getTime();
  const yearEnd = useMemo(() => endOfYear(new Date(yearStartMs)), [yearStartMs]);

  const yearOptions = useMemo(() => {
    const current = startOfYear(new Date());
    return Array.from({ length: YEARS_BACK }, (_, i) => addYears(current, -i));
  }, []);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-brand-primary">Reporte Anual</h2>
        <select
          className="input"
          value={yearStartMs}
          onChange={(e) => onYearChange(new Date(Number(e.target.value)))}
        >
          {yearOptions.map((y, i) => (
            <option key={y.getTime()} value={y.getTime()}>
              {format(y, 'yyyy', { locale: es })}{i === 0 ? ' (actual)' : ''}
            </option>
          ))}
        </select>
      </div>

      <AttendanceRangeTable
        restaurantId={restaurantId}
        employees={employees}
        rangeStart={yearStart}
        rangeEnd={yearEnd}
        refreshKey={refreshKey}
        branchName={branchName}
        emptyLabel="este año"
      />
    </div>
  );
};

export default AnnualReport;
