import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { getVacationRequests } from '../../services/vacationService';
import type { AttendanceEmployee, VacationRequest } from '../../types/Attendance';
import { vacationDaysForSeniority, getAnniversaryWindow } from '../../utils/vacationUtils';
import { localDateKey } from '../../utils/attendanceStatus';
import ApproveVacationModal from './ApproveVacationModal';

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface VacationsReportProps {
  restaurantId: number;
  employees: AttendanceEmployee[];
  /** Bump to force a refetch (e.g. after a device sync). */
  refreshKey?: number;
}

const VacationsReport: React.FC<VacationsReportProps> = ({
  restaurantId,
  employees,
  refreshKey = 0,
}) => {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const loadVacations = () => {
    setLoading(true);
    setError(null);
    getVacationRequests(restaurantId)
      .then(setVacationRequests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar vacaciones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVacations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, refreshKey]);

  const displayName = (emp: AttendanceEmployee) => emp.linkedUser?.displayName || emp.name;

  // Same "linked users only" rule as the other Incidencias reports, sorted
  // by the same admin-defined sortOrder so every report agrees.
  const eligible = useMemo(
    () =>
      employees
        .filter((e) => e.isActive && e.linkedUser)
        .sort((a, b) => a.sortOrder - b.sortOrder || displayName(a).localeCompare(displayName(b))),
    [employees],
  );

  const rows = useMemo(() => {
    const today = new Date();
    return eligible.map((emp) => {
      const linkedUser = emp.linkedUser!;
      if (!linkedUser.hireDate) {
        return { emp, hasHireDate: false as const };
      }
      const hireDate = new Date(`${linkedUser.hireDate.slice(0, 10)}T00:00:00`);
      const { windowStart, windowEnd, completedYears } = getAnniversaryWindow(hireDate, today);
      const total = vacationDaysForSeniority(completedYears);
      const windowStartKey = localDateKey(windowStart);
      const windowEndKey = localDateKey(windowEnd);
      const used = vacationRequests
        .filter(
          (v) =>
            v.userId === linkedUser.id &&
            v.startDate >= windowStartKey &&
            v.startDate < windowEndKey,
        )
        .reduce((sum, v) => sum + v.businessDays, 0);
      return {
        emp,
        hasHireDate: true as const,
        windowStart,
        windowEnd,
        total,
        used,
        available: total - used,
      };
    });
  }, [eligible, vacationRequests]);

  const approveEligibleEmployees = useMemo(
    () => eligible.filter((e) => e.linkedUser?.hireDate),
    [eligible],
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-primary">Vacaciones</h2>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowApproveModal(true)}
        >
          <Plus size={16} /> Aprobar Vacaciones
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 pr-4 font-semibold text-gray-600">Nombre</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 whitespace-nowrap">Fecha inicio</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 whitespace-nowrap">Fecha Fin</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center whitespace-nowrap">Total Vacaciones</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center whitespace-nowrap">Vacaciones utilizadas</th>
              <th className="pb-3 px-2 font-semibold text-gray-600 text-center whitespace-nowrap">Vacaciones Disponibles</th>
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
                  No hay empleados que mostrar.
                </td>
              </tr>
            ) : (
              rows.map((row) =>
                row.hasHireDate ? (
                  <tr key={row.emp.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">
                      {displayName(row.emp)}
                    </td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{formatDate(row.windowStart)}</td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{formatDate(row.windowEnd)}</td>
                    <td className="py-2 px-2 text-center">{row.total}</td>
                    <td className="py-2 px-2 text-center">{row.used}</td>
                    <td className="py-2 px-2 text-center font-semibold">{row.available}</td>
                  </tr>
                ) : (
                  <tr key={row.emp.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">
                      {displayName(row.emp)}
                    </td>
                    <td colSpan={5} className="py-2 px-2 text-gray-400">
                      Sin fecha de ingreso registrada
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {showApproveModal && (
        <ApproveVacationModal
          employees={approveEligibleEmployees}
          vacationRequests={vacationRequests}
          onClose={() => setShowApproveModal(false)}
          onApproved={() => {
            setShowApproveModal(false);
            loadVacations();
          }}
        />
      )}
    </div>
  );
};

export default VacationsReport;
