import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Download, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAttendance,
  syncAttendance,
  downloadAttendanceCsv,
  getEmployees,
  getRestaurants,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/attendanceApiService';
import type {
  AttendanceRecord,
  PaginatedAttendance,
  SyncResult,
  AttendanceEmployee,
  AttendanceQuery,
  CreateEmployeeData,
  Restaurant,
} from '../types/Attendance';

// One row per employee per day — first event = entrada, last = salida
interface DayRecord {
  key: string;
  employeeId: number;
  employeeName: string;
  hikvisionId: string;
  department: string | null;
  date: string;           // display date (localised)
  entrada: AttendanceRecord;
  salida: AttendanceRecord | null; // null when only one event that day
}

/** Collapse raw records into one DayRecord per (employee, calendar day). */
function groupByDay(records: AttendanceRecord[]): DayRecord[] {
  const map = new Map<string, AttendanceRecord[]>();

  for (const r of records) {
    // Use the LOCAL date from the ISO string (device stores local time)
    const localDate = new Date(r.checkedAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
    const key = `${r.employeeId}-${localDate}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }

  const result: DayRecord[] = [];
  for (const [key, recs] of map) {
    recs.sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime());
    const first = recs[0];
    const last = recs[recs.length - 1];
    const localDate = new Date(first.checkedAt).toLocaleDateString('en-CA');
    result.push({
      key,
      employeeId: first.employeeId,
      employeeName: first.employeeName,
      hikvisionId: first.hikvisionId,
      department: first.department,
      date: localDate,
      entrada: first,
      salida: recs.length > 1 ? last : null,
    });
  }

  // Sort: date descending, then employee name ascending
  result.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.employeeName.localeCompare(b.employeeName);
  });

  return result;
}

// Map Firebase branch names → NestJS restaurant IDs
const BRANCH_TO_RESTAURANT: Record<string, number> = {
  'San Pedro': 1,
  'Las Quintas': 2,
};

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function firstOfMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function formatDateTime(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  const date = d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
}

const EMPTY_FORM: CreateEmployeeData = { hikvisionId: '', name: '', department: '', email: '' };

const ChecadorPage: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();

  // Restaurant selection
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Attendance state
  const [attendance, setAttendance] = useState<PaginatedAttendance | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<AttendanceQuery>({
    startDate: firstOfMonthIso(),
    endDate: todayIso(),
    page: 1,
    limit: 200, // fetch up to 200 raw events so groupByDay sees the full day for every record
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // CSV download
  const [downloading, setDownloading] = useState(false);

  // Employees panel
  const [employees, setEmployees] = useState<AttendanceEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AttendanceEmployee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeData>(EMPTY_FORM);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // ─── Determine restaurantId on mount ─────────────────────────────────────
  useEffect(() => {
    if (isAdmin) {
      getRestaurants()
        .then((list) => {
          setRestaurants(list);
          if (list.length > 0) setRestaurantId(list[0].id);
        })
        .catch(() => setRestaurantId(null));
    } else if (userProfile?.branch) {
      const id = BRANCH_TO_RESTAURANT[userProfile.branch as string];
      setRestaurantId(id ?? null);
    }
  }, [isAdmin, userProfile]);

  // ─── Load employees when restaurant changes ───────────────────────────────
  const loadEmployees = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingEmployees(true);
    try {
      const list = await getEmployees(restaurantId);
      setEmployees(list);
    } catch {
      // non-critical; employee dropdown will be empty
    } finally {
      setLoadingEmployees(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // ─── Load attendance ──────────────────────────────────────────────────────
  const loadAttendance = useCallback(
    async (query: AttendanceQuery) => {
      if (!restaurantId) return;
      setLoadingAttendance(true);
      setAttendanceError(null);
      try {
        const data = await getAttendance(restaurantId, query);
        setAttendance(data);
      } catch (err) {
        setAttendanceError(err instanceof Error ? err.message : 'Error al cargar registros');
      } finally {
        setLoadingAttendance(false);
      }
    },
    [restaurantId],
  );

  // Initial load when restaurant is set
  useEffect(() => {
    if (restaurantId) {
      loadAttendance({ ...filters, employeeId: selectedEmployeeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, loadAttendance]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  function handleSearch() {
    const q = { ...filters, page: 1, employeeId: selectedEmployeeId };
    setFilters(q);
    loadAttendance(q);
  }

  async function handleSync() {
    if (!restaurantId || syncing) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncAttendance(restaurantId);
      setSyncResult(result);
      if (result.status === 'success') {
        const q = { ...filters, page: 1, employeeId: selectedEmployeeId };
        setFilters(q);
        await loadAttendance(q);
      }
    } catch (err) {
      setSyncResult({
        restaurantId: restaurantId,
        status: 'error',
        recordsSynced: 0,
        errorMessage: err instanceof Error ? err.message : 'Error al sincronizar',
        syncedAt: new Date().toISOString(),
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleDownloadCsv() {
    if (!restaurantId || downloading) return;
    setDownloading(true);
    try {
      await downloadAttendanceCsv(restaurantId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        employeeId: selectedEmployeeId,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al descargar CSV');
    } finally {
      setDownloading(false);
    }
  }

  // ─── Employee CRUD ────────────────────────────────────────────────────────
  function startAdd() {
    setEditingEmployee(null);
    setEmployeeForm(EMPTY_FORM);
    setEmployeeError(null);
    setShowAddForm(true);
  }

  function startEdit(emp: AttendanceEmployee) {
    setEditingEmployee(emp);
    setEmployeeForm({
      hikvisionId: emp.hikvisionId,
      name: emp.name,
      department: emp.department ?? '',
      email: emp.email ?? '',
    });
    setEmployeeError(null);
    setShowAddForm(true);
  }

  function cancelForm() {
    setShowAddForm(false);
    setEditingEmployee(null);
    setEmployeeForm(EMPTY_FORM);
    setEmployeeError(null);
  }

  async function handleSaveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSavingEmployee(true);
    setEmployeeError(null);
    try {
      const data: CreateEmployeeData = {
        hikvisionId: employeeForm.hikvisionId.trim(),
        name: employeeForm.name.trim(),
        ...(employeeForm.department?.trim() ? { department: employeeForm.department.trim() } : {}),
        ...(employeeForm.email?.trim() ? { email: employeeForm.email.trim() } : {}),
      };
      if (editingEmployee) {
        await updateEmployee(restaurantId, editingEmployee.id, data);
      } else {
        await createEmployee(restaurantId, data);
      }
      cancelForm();
      await loadEmployees();
    } catch (err) {
      setEmployeeError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingEmployee(false);
    }
  }

  async function handleDeleteEmployee(emp: AttendanceEmployee) {
    if (!restaurantId) return;
    if (!confirm(`¿Desactivar a ${emp.name}?`)) return;
    try {
      await deleteEmployee(restaurantId, emp.id);
      await loadEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!restaurantId) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-brand-primary mb-4">Checador</h1>
        <p className="text-gray-500">No se encontró un restaurante asociado a tu sucursal.</p>
      </div>
    );
  }

  const dayRows = groupByDay(attendance?.data ?? []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Checador</h1>
            {isAdmin && restaurants.length > 1 && (
              <select
                className="input mt-2"
                value={restaurantId}
                onChange={(e) => setRestaurantId(Number(e.target.value))}
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button
              className="btn flex items-center gap-2"
              onClick={handleDownloadCsv}
              disabled={downloading}
            >
              <Download size={16} />
              {downloading ? 'Descargando...' : 'Descargar CSV'}
            </button>
          </div>
        </div>

        {/* Sync result banner */}
        {syncResult && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg flex items-center justify-between text-sm font-medium ${
              syncResult.status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>
              {syncResult.status === 'success'
                ? `✓ Sincronizado — ${syncResult.recordsSynced} registro${syncResult.recordsSynced !== 1 ? 's' : ''} nuevo${syncResult.recordsSynced !== 1 ? 's' : ''}`
                : `✗ Error al sincronizar${syncResult.errorMessage ? `: ${syncResult.errorMessage}` : ''}`}
            </span>
            <button onClick={() => setSyncResult(null)} className="ml-4 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              className="input"
              value={filters.startDate ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              className="input"
              value={filters.endDate ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Empleado</label>
            <select
              className="input"
              value={selectedEmployeeId ?? ''}
              onChange={(e) =>
                setSelectedEmployeeId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">Todos</option>
              {employees
                .filter((emp) => emp.isActive)
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            Buscar
          </button>
        </div>
      </div>

      {/* ── Attendance Table ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-primary">Registros de Asistencia</h2>
          {!loadingAttendance && attendance && (
            <span className="text-sm text-gray-500">
              {dayRows.length} día{dayRows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {attendanceError && <p className="text-red-600 text-sm mb-4">{attendanceError}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-semibold text-gray-600">Empleado</th>
                <th className="pb-3 font-semibold text-gray-600">Departamento</th>
                <th className="pb-3 font-semibold text-gray-600">Fecha</th>
                <th className="pb-3 font-semibold text-gray-600 text-center">Entrada</th>
                <th className="pb-3 font-semibold text-gray-600 text-center">Salida</th>
              </tr>
            </thead>
            <tbody>
              {loadingAttendance ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 pr-4">
                        <div className="animate-pulse bg-gray-200 rounded h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : dayRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No hay registros para el período seleccionado.
                  </td>
                </tr>
              ) : (
                dayRows.map((row) => {
                  const entradaTime = formatDateTime(row.entrada.checkedAt).time;
                  const salidaTime  = row.salida ? formatDateTime(row.salida.checkedAt).time : null;
                  const displayDate = new Date(row.date + 'T12:00:00').toLocaleDateString('es-MX', {
                    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
                  });
                  return (
                    <tr
                      key={row.key}
                      className="border-b border-gray-100 hover:bg-brand-primarySoft transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-800">{row.employeeName}</td>
                      <td className="py-3 pr-4 text-gray-600">{row.department ?? '—'}</td>
                      <td className="py-3 pr-4 text-gray-600 capitalize">{displayDate}</td>
                      <td className="py-3 pr-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {entradaTime}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {salidaTime ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {salidaTime}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Employee Management (admin only) ── */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-primary">Gestión de Empleados</h2>
            {!showAddForm && (
              <button className="btn btn-primary flex items-center gap-2" onClick={startAdd}>
                <Plus size={16} /> Agregar empleado
              </button>
            )}
          </div>

          {/* Add / Edit form */}
          {showAddForm && (
            <form
              onSubmit={handleSaveEmployee}
              className="bg-brand-primarySoft rounded-lg p-4 mb-5 space-y-3"
            >
              <h3 className="font-semibold text-brand-primary">
                {editingEmployee ? 'Editar empleado' : 'Nuevo empleado'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ID Hikvision <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input w-full"
                    required
                    value={employeeForm.hikvisionId}
                    onChange={(e) => setEmployeeForm((f) => ({ ...f, hikvisionId: e.target.value }))}
                    placeholder="Ej: 1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input w-full"
                    required
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Departamento</label>
                  <input
                    className="input w-full"
                    value={employeeForm.department ?? ''}
                    onChange={(e) => setEmployeeForm((f) => ({ ...f, department: e.target.value }))}
                    placeholder="Ej: Cocina"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Correo</label>
                  <input
                    className="input w-full"
                    type="email"
                    value={employeeForm.email ?? ''}
                    onChange={(e) => setEmployeeForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
              {employeeError && <p className="text-red-600 text-sm">{employeeError}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn" onClick={cancelForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingEmployee}>
                  {savingEmployee ? 'Guardando...' : editingEmployee ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          )}

          {/* Employees table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-semibold text-gray-600">Nombre</th>
                  <th className="pb-3 font-semibold text-gray-600">ID Hikvision</th>
                  <th className="pb-3 font-semibold text-gray-600">Departamento</th>
                  <th className="pb-3 font-semibold text-gray-600">Estado</th>
                  <th className="pb-3 font-semibold text-gray-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingEmployees ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="animate-pulse bg-gray-200 rounded h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No hay empleados registrados.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-gray-100 hover:bg-brand-primarySoft transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-800">{emp.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{emp.hikvisionId}</td>
                      <td className="py-3 pr-4 text-gray-600">{emp.department ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {emp.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(emp)}
                            className="p-1.5 text-gray-500 hover:text-brand-primary transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp)}
                            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                            title="Desactivar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecadorPage;
