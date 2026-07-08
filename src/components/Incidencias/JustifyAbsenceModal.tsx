import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { justifyAbsence } from '../../services/attendanceApiService';

interface JustifyAbsenceModalProps {
  restaurantId: number;
  employeeId: number;
  employeeName: string;
  date: string; // YYYY-MM-DD
  onClose: () => void;
  onConfirmed: () => void;
}

function formatDateLabel(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const JustifyAbsenceModal: React.FC<JustifyAbsenceModalProps> = ({
  restaurantId,
  employeeId,
  employeeName,
  date,
  onClose,
  onConfirmed,
}) => {
  const { userProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await justifyAbsence(restaurantId, {
        employeeId,
        date,
        justifiedById: userProfile?.uid,
      });
      onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al justificar la falta');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="text-brand-secondary mr-3" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">Justificar falta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitting}
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-700">
            ¿Deseas convertir esta falta injustificada de <strong>{employeeName}</strong> el{' '}
            <strong>{formatDateLabel(date)}</strong> en falta justificada?
          </p>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={submitting}
            >
              Declinar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JustifyAbsenceModal;
