import React, { useMemo } from 'react';
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttendanceEmployee } from '../../types/Attendance';
import AttendanceRangeTable from './AttendanceRangeTable';

const MONTHS_BACK = 12;

interface MonthlyReportProps {
  restaurantId: number;
  employees: AttendanceEmployee[];
  monthStart: Date;
  onMonthChange: (monthStart: Date) => void;
  /** Bump to force a refetch (e.g. after a device sync). */
  refreshKey?: number;
  /** Branch name used to match this restaurant's "holiday" calendar events. */
  branchName?: string | null;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({
  restaurantId,
  employees,
  monthStart,
  onMonthChange,
  refreshKey = 0,
  branchName = null,
}) => {
  const monthStartMs = monthStart.getTime();
  const monthEnd = useMemo(() => endOfMonth(new Date(monthStartMs)), [monthStartMs]);

  const monthOptions = useMemo(() => {
    const current = startOfMonth(new Date());
    return Array.from({ length: MONTHS_BACK }, (_, i) => addMonths(current, -i));
  }, []);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-brand-primary">Reporte Mensual</h2>
        <select
          className="input"
          value={monthStartMs}
          onChange={(e) => onMonthChange(new Date(Number(e.target.value)))}
        >
          {monthOptions.map((m, i) => (
            <option key={m.getTime()} value={m.getTime()}>
              {format(m, 'MMMM yyyy', { locale: es })}{i === 0 ? ' (actual)' : ''}
            </option>
          ))}
        </select>
      </div>

      <AttendanceRangeTable
        restaurantId={restaurantId}
        employees={employees}
        rangeStart={monthStart}
        rangeEnd={monthEnd}
        refreshKey={refreshKey}
        branchName={branchName}
        emptyLabel="este mes"
      />
    </div>
  );
};

export default MonthlyReport;
