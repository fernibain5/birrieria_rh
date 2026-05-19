import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Download, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { completeMinutaArea, getAllMinutas } from '../services/minutaService';
import { Minuta, MinutaArea, MinutaStatus } from '../types/Minuta';
import { UserBranch } from '../types/auth';
import { generateAttendanceListDocx } from '../utils/attendanceListGenerator';
import { generateMinutaDocx } from '../utils/minutaDocxGenerator';
import BranchDropdown from '../components/ui/BranchDropdown';

const tabLabels: Record<MinutaStatus, string> = {
  pending: 'Pendientes',
  completed: 'Completadas',
};

const getStatus = (status?: MinutaStatus): MinutaStatus =>
  status === 'completed' ? 'completed' : 'pending';

const getAreaResponsibleUids = (area: MinutaArea): string[] =>
  area.encargadoUids || (area.encargadoUid ? [area.encargadoUid] : []);

const HistorialMinutasPage: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const [minutas, setMinutas] = useState<Minuta[]>([]);
  const [activeStatus, setActiveStatus] = useState<MinutaStatus>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [completingKey, setCompletingKey] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<UserBranch>(
    (userProfile?.branch as UserBranch) ?? 'San Pedro'
  );
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadMinutas = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const allMinutas = await getAllMinutas();
      setMinutas(allMinutas);
    } catch (error) {
      console.error('Error loading minutas:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar el historial de minutas.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMinutas();
  }, []);

  const branchMinutas = useMemo(
    () => minutas.filter(m => !m.branch || m.branch === selectedBranch),
    [minutas, selectedBranch]
  );

  const filteredMinutas = useMemo(
    () => branchMinutas.filter(minuta => getStatus(minuta.status) === activeStatus),
    [activeStatus, branchMinutas]
  );

  const counts = useMemo(
    () => ({
      pending: branchMinutas.filter(minuta => getStatus(minuta.status) === 'pending').length,
      completed: branchMinutas.filter(minuta => getStatus(minuta.status) === 'completed').length,
    }),
    [branchMinutas]
  );

  const canCompleteArea = (area: MinutaArea) => {
    if (!userProfile || getStatus(area.status) === 'completed') {
      return false;
    }

    return isAdmin || getAreaResponsibleUids(area).includes(userProfile.uid);
  };

  const completeArea = async (minutaId: string, areaIndex: number) => {
    if (!userProfile) return;

    const completionKey = `${minutaId}-${areaIndex}`;
    setCompletingKey(completionKey);
    setMessage(null);

    try {
      const updatedMinuta = await completeMinutaArea(minutaId, areaIndex, userProfile);
      setMinutas(currentMinutas =>
        currentMinutas.map(minuta =>
          minuta.id === updatedMinuta.id ? updatedMinuta : minuta
        )
      );
      setMessage({
        type: 'success',
        text: 'Partida completada correctamente.',
      });
    } catch (error) {
      console.error('Error completing partida:', error);
      setMessage({
        type: 'error',
        text: 'No se pudo completar la partida.',
      });
    } finally {
      setCompletingKey(null);
    }
  };

  const downloadMinuta = async (minuta: Minuta) => {
    if (!minuta.generalInfo) return;

    await generateMinutaDocx({
      generalInfo: minuta.generalInfo,
      areas: minuta.areas || [],
      attendees: minuta.attendees || [],
    });
  };

  const downloadAttendance = async (minuta: Minuta) => {
    if (!minuta.generalInfo) return;

    await generateAttendanceListDocx({
      attendanceInfo: minuta.generalInfo,
      employees: minuta.attendees || [],
    });
  };

  return (
    <div className="card">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BranchDropdown
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
          />
          <h1 className="text-2xl font-bold text-gray-800">Historial Minutas</h1>
        </div>
        <button
          type="button"
          onClick={loadMinutas}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            message.type === 'success'
              ? 'border-green-200 bg-green-100 text-green-700'
              : 'border-red-200 bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 grid w-full grid-cols-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {(['pending', 'completed'] as MinutaStatus[]).map(status => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={`min-h-11 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeStatus === status
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-700 hover:bg-white'
            }`}
          >
            {tabLabels[status]} ({counts[status]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-gray-500">Cargando minutas...</p>
      ) : filteredMinutas.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No hay minutas en este estado.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredMinutas.map(minuta => (
            <div key={minuta.id} className="rounded-lg border bg-gray-50 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {minuta.generalInfo?.evento || minuta.role || 'Minuta sin evento'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {minuta.generalInfo?.lugar || minuta.branch || 'Sin lugar'}
                  </p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <strong className="text-sm text-gray-600">Supervisor:</strong>
                  <p className="text-gray-800">{minuta.supervisor || 'Sin supervisor'}</p>
                </div>
                <div>
                  <strong className="text-sm text-gray-600">
                    {minuta.nextMeetingDate ? 'Próxima reunión:' : 'Fecha de reunión:'}
                  </strong>
                  <p className="text-gray-800">
                    {minuta.nextMeetingDate
                      ? minuta.nextMeetingDate.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : minuta.generalInfo?.date || 'Sin fecha'}
                  </p>
                </div>
                <div>
                  <strong className="text-sm text-gray-600">Creada:</strong>
                  <p className="text-gray-800">{minuta.createdAt.toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              {minuta.areas && minuta.areas.length > 0 ? (
                <div className="mb-4">
                  <strong className="text-sm text-gray-600">Partidas:</strong>
                  <div className="mt-2 space-y-3">
                    {minuta.areas.map((area, idx) => {
                      const completionKey = `${minuta.id}-${idx}`;

                      return (
                        <div key={`${minuta.id}-area-${idx}`} className="rounded border bg-white p-3">
                          <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <p className="font-medium text-gray-800">
                              {idx + 1}. {area.area}
                            </p>
                            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                              {canCompleteArea(area) && (
                                <button
                                  type="button"
                                  onClick={() => completeArea(minuta.id, idx)}
                                  disabled={completingKey === completionKey}
                                  className="inline-flex items-center gap-2 rounded bg-brand-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  {completingKey === completionKey ? 'Completando...' : 'Completar'}
                                </button>
                              )}
                              <p className="text-base text-gray-900">
                                Fecha compromiso: {area.fechaCompromiso || 'Sin fecha'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold text-gray-700">Planteamiento del problema: </span>
                              {area.planteamiento}
                            </p>
                            <p>
                              <span className="font-semibold text-gray-700">Seguimiento: </span>
                              {area.seguimiento}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Responsable: {area.encargadoName || 'Sin responsable'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <strong className="text-sm text-gray-600">¿Qué pasó?</strong>
                  <p className="mt-1 text-gray-800">{minuta.whatHappened || 'Sin detalle'}</p>
                </div>
              )}

              {minuta.generalInfo && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => downloadMinuta(minuta)}
                    className="inline-flex items-center justify-center gap-2 rounded bg-brand-primary px-4 py-2 text-white transition-colors hover:bg-brand-primaryHover"
                  >
                    <FileText className="h-4 w-4" />
                    Descargar Minuta
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadAttendance(minuta)}
                    className="inline-flex items-center justify-center gap-2 rounded bg-brand-secondary px-4 py-2 text-white transition-colors hover:bg-brand-secondaryHover"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Asistencia
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialMinutasPage;
