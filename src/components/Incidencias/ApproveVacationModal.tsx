import React, { useState } from 'react';
import { X, CalendarCheck } from 'lucide-react';
import type { AttendanceEmployee, VacationRequest } from '../../types/Attendance';
import { vacationDaysForSeniority, getAnniversaryWindow } from '../../utils/vacationUtils';
import { localDateKey } from '../../utils/attendanceStatus';
import { createVacationRequest } from '../../services/vacationService';

interface ApproveVacationModalProps {
  /** Linked employees that have a hireDate — the same eligibility as the table. */
  employees: AttendanceEmployee[];
  vacationRequests: VacationRequest[];
  onClose: () => void;
  onApproved: () => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** apiClient's handle() throws `API <status>: <raw body>` — pull out the DTO's `message` field. */
function extractErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Error al aprobar vacaciones';
  const match = err.message.match(/^API \d+: ([\s\S]*)$/);
  if (!match) return err.message;
  try {
    const parsed = JSON.parse(match[1]);
    if (typeof parsed.message === 'string') return parsed.message;
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
  } catch {
    // not JSON — fall through to the raw body
  }
  return match[1];
}

const ApproveVacationModal: React.FC<ApproveVacationModalProps> = ({
  employees,
  vacationRequests,
  onClose,
  onApproved,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedEmployee = employees.find((e) => String(e.id) === selectedEmployeeId);
  const linkedUser = selectedEmployee?.linkedUser;

  const info = (() => {
    if (!linkedUser?.hireDate) return null;
    const hireDate = new Date(`${linkedUser.hireDate.slice(0, 10)}T00:00:00`);
    const { windowStart, windowEnd, completedYears } = getAnniversaryWindow(hireDate, new Date());
    const total = vacationDaysForSeniority(completedYears);
    const windowStartKey = localDateKey(windowStart);
    const windowEndKey = localDateKey(windowEnd);
    const used = vacationRequests
      .filter(
        (v) => v.userId === linkedUser.id && v.startDate >= windowStartKey && v.startDate < windowEndKey,
      )
      .reduce((sum, v) => sum + v.businessDays, 0);
    return { windowStart, windowEnd, total, used, available: total - used };
  })();

  const isValidRange = Boolean(startDate) && Boolean(endDate) && startDate <= endDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedUser || !isValidRange) return;
    setSubmitting(true);
    setError('');
    try {
      await createVacationRequest({ userId: linkedUser.id, startDate, endDate });
      onApproved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CalendarCheck className="text-brand-secondary mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Aprobar Vacaciones</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
              Empleado
            </label>
            <select
              id="employeeId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              required
              disabled={submitting}
            >
              <option value="">Selecciona un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.linkedUser?.displayName || emp.name}
                </option>
              ))}
            </select>
          </div>

          {info && (
            <div className="bg-brand-primarySoft rounded-md p-3 text-sm text-gray-700">
              <strong>{info.available}</strong> día{info.available !== 1 ? 's' : ''} disponible
              {info.available !== 1 ? 's' : ''} de {info.total} totales, calculado del{' '}
              {formatDate(info.windowStart)} al {formatDate(info.windowEnd)}.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-sm text-gray-600 mb-1">
                Desde
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm text-gray-600 mb-1">
                Hasta
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>
          {startDate && endDate && !isValidRange && (
            <p className="text-red-600 text-sm">La fecha "Desde" no puede ser posterior a "Hasta".</p>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors disabled:opacity-50"
              disabled={submitting || !linkedUser || !isValidRange}
            >
              {submitting ? 'Guardando...' : 'Aprobar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveVacationModal;
