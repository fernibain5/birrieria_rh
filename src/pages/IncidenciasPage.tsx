import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RefreshCw, Plus, Pencil, Trash2, X, GripVertical, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  syncAttendance,
  getEmployees,
  getRestaurants,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  reorderEmployees,
} from '../services/attendanceApiService';
import { getAllUsers } from '../services/userService';
import { useRoles } from '../hooks/useRoles';
import type { UserProfile } from '../types/auth';
import type {
  SyncResult,
  AttendanceEmployee,
  CreateEmployeeData,
  Restaurant,
} from '../types/Attendance';
import WeeklyReport from '../components/Incidencias/WeeklyReport';
import MonthlyReport from '../components/Incidencias/MonthlyReport';
import RangeReport from '../components/Incidencias/RangeReport';
import AnnualReport from '../components/Incidencias/AnnualReport';
import VacationsReport from '../components/Incidencias/VacationsReport';
import ManualSyncModal from '../components/Incidencias/ManualSyncModal';
import { startOfWeek } from '../utils/weekUtils';

const EMPTY_FORM: CreateEmployeeData = { hikvisionId: '', name: '', department: '', email: '' };

interface EmployeeRowProps {
  emp: AttendanceEmployee;
  onEdit: (emp: AttendanceEmployee) => void;
  onDelete: (emp: AttendanceEmployee) => void;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({ emp, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: emp.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 transition-colors ${
        isDragging ? 'relative z-10 bg-white opacity-80 shadow-lg ring-2 ring-brand-secondary' : 'hover:bg-brand-primarySoft'
      }`}
    >
      <td className="py-3 pr-2 w-8">
        <button
          type="button"
          className="cursor-grab p-1 text-gray-400 hover:text-brand-primary active:cursor-grabbing"
          title="Reordenar"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </td>
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
            onClick={() => onEdit(emp)}
            className="p-1.5 text-gray-500 hover:text-brand-primary transition-colors"
            title="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(emp)}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
            title="Desactivar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const IncidenciasPage: React.FC = () => {
  const { userProfile, isAdmin, isManager } = useAuth();

  // Restaurant selection
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Weekly report state (lifted here so the CSV download shares the range)
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  // Monthly report state (lifted here so the selection survives tab switches)
  const [monthStart, setMonthStart] = useState<Date>(() => startOfMonth(new Date()));

  // Range report state (lifted here so the selection survives tab switches)
  const [rangeStart, setRangeStart] = useState<Date>(() => startOfMonth(new Date()));
  const [rangeEnd, setRangeEnd] = useState<Date>(() => endOfMonth(new Date()));

  // Annual report state (lifted here so the selection survives tab switches)
  const [yearStart, setYearStart] = useState<Date>(() => startOfYear(new Date()));

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [manualSyncOpen, setManualSyncOpen] = useState(false);

  // Employees panel
  const [employees, setEmployees] = useState<AttendanceEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AttendanceEmployee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeData>(EMPTY_FORM);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [newEmployeePasscode, setNewEmployeePasscode] = useState<{ name: string; passcode: string } | null>(null);

  // Active report tab
  const [activeTab, setActiveTab] = useState<
    'weekly' | 'employees' | 'monthly' | 'range' | 'annual' | 'vacaciones'
  >('weekly');

  // Name search + role filter shared across all report tabs (not the Empleados tab)
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const { roles } = useRoles();

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ─── Determine restaurantId on mount ─────────────────────────────────────
  // Resolved dynamically against the real Restaurant table rather than a
  // hardcoded id map — restaurant ids aren't guaranteed to line up with any
  // fixed San Pedro/Las Quintas ordering.
  useEffect(() => {
    getRestaurants()
      .then((list) => {
        setRestaurants(list);
        if (isAdmin) {
          if (list.length > 0) setRestaurantId(list[0].id);
        } else if (userProfile?.branch) {
          const match = list.find((r) => r.name === userProfile.branch);
          setRestaurantId(match?.id ?? null);
        } else {
          setRestaurantId(null);
        }
      })
      .catch(() => setRestaurantId(null));
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

  // ─── Load all website users once, to resolve each linked employee's role ──
  useEffect(() => {
    getAllUsers()
      .then(setAllUsers)
      .catch(() => {
        // non-critical; role filter will just show no matches
      });
  }, []);

  const uidToRole = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of allUsers) map.set(user.uid, user.role);
    return map;
  }, [allUsers]);

  const visibleEmployees = useMemo(() => {
    const normalizedName = nameFilter.trim().toLowerCase();
    return employees
      .filter((emp) => {
        if (!normalizedName) return true;
        const name = emp.linkedUser?.displayName || emp.name;
        return name.toLowerCase().includes(normalizedName);
      })
      .filter((emp) => {
        if (!roleFilter) return true;
        return uidToRole.get(emp.linkedUser?.id ?? '') === roleFilter;
      });
  }, [employees, nameFilter, roleFilter, uidToRole]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  async function handleSync(deviceIp?: string) {
    if (!restaurantId || syncing) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncAttendance(restaurantId, deviceIp);
      setSyncResult(result);
      if (result.status === 'success') {
        setReportRefreshKey((k) => k + 1);
        await loadEmployees();
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

  // ─── Employee CRUD ────────────────────────────────────────────────────────
  function startAdd() {
    setEditingEmployee(null);
    setEmployeeForm(EMPTY_FORM);
    setEmployeeError(null);
    setNewEmployeePasscode(null);
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
        cancelForm();
      } else {
        const created = await createEmployee(restaurantId, data);
        setShowAddForm(false);
        setEmployeeForm(EMPTY_FORM);
        if (created.passcode) {
          setNewEmployeePasscode({ name: created.name, passcode: created.passcode });
        }
      }
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

  async function handleEmployeeDragEnd(event: DragEndEvent) {
    if (!restaurantId) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = employees.findIndex((e) => e.id === active.id);
    const newIndex = employees.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(employees, oldIndex, newIndex);
    setEmployees(reordered);
    try {
      await reorderEmployees(restaurantId, reordered.map((e) => e.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar el nuevo orden');
      await loadEmployees();
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!restaurantId) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-brand-primary mb-4">Incidencias</h1>
        <p className="text-gray-500">No se encontró un restaurante asociado a tu sucursal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Incidencias</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {isAdmin && restaurants.length > 1 && (
                <select
                  className="input"
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
              {isManager && (
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('weekly')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === 'weekly'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    Reporte Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('monthly')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === 'monthly'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    Reporte Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('range')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === 'range'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    Reporte por Rango
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('annual')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === 'annual'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    Reporte Anual
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vacaciones')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === 'vacaciones'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    Vacaciones
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('employees')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === 'employees'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    Empleados
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => handleSync()}
              disabled={syncing}
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button
              className="btn border border-brand-primary text-brand-primary hover:bg-gray-50 flex items-center gap-2"
              onClick={() => setManualSyncOpen(true)}
              disabled={syncing}
            >
              <RefreshCw size={16} />
              Sincronizar Manual
            </button>
          </div>
        </div>

        {/* Sync result banner */}
        {syncResult && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg flex items-center justify-between text-sm font-medium ${
              syncResult.status !== 'success'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : syncResult.importError
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            <span>
              {syncResult.status !== 'success'
                ? `✗ Error al sincronizar${syncResult.errorMessage ? `: ${syncResult.errorMessage}` : ''}`
                : syncResult.importError
                  ? `⚠ Falló la importación de empleados: ${syncResult.importError} — ${syncResult.recordsSynced} registro${syncResult.recordsSynced !== 1 ? 's' : ''} nuevo${syncResult.recordsSynced !== 1 ? 's' : ''}`
                  : `✓ Sincronizado — ${syncResult.recordsSynced} registro${syncResult.recordsSynced !== 1 ? 's' : ''} nuevo${syncResult.recordsSynced !== 1 ? 's' : ''}${syncResult.employeesImported ? `, ${syncResult.employeesImported} empleado${syncResult.employeesImported !== 1 ? 's' : ''} importado${syncResult.employeesImported !== 1 ? 's' : ''}` : ''}`}
            </span>
            <button onClick={() => setSyncResult(null)} className="ml-4 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Name search + role filter (all report tabs, not Empleados) ── */}
      {activeTab !== 'employees' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Buscar empleado..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              />
            </div>
            <select
              className="input sm:w-56"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Weekly Report ── */}
      {activeTab === 'weekly' && (
        <WeeklyReport
          restaurantId={restaurantId}
          employees={visibleEmployees}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          refreshKey={reportRefreshKey}
          branchName={restaurants.find((r) => r.id === restaurantId)?.name ?? null}
        />
      )}

      {/* ── Monthly Report (admin only) ── */}
      {isManager && activeTab === 'monthly' && (
        <MonthlyReport
          restaurantId={restaurantId}
          employees={visibleEmployees}
          monthStart={monthStart}
          onMonthChange={setMonthStart}
          refreshKey={reportRefreshKey}
          branchName={restaurants.find((r) => r.id === restaurantId)?.name ?? null}
        />
      )}

      {/* ── Range Report (admin only) ── */}
      {isManager && activeTab === 'range' && (
        <RangeReport
          restaurantId={restaurantId}
          employees={visibleEmployees}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeChange={(start, end) => {
            setRangeStart(start);
            setRangeEnd(end);
          }}
          refreshKey={reportRefreshKey}
          branchName={restaurants.find((r) => r.id === restaurantId)?.name ?? null}
        />
      )}

      {/* ── Annual Report (admin only) ── */}
      {isManager && activeTab === 'annual' && (
        <AnnualReport
          restaurantId={restaurantId}
          employees={visibleEmployees}
          yearStart={yearStart}
          onYearChange={setYearStart}
          refreshKey={reportRefreshKey}
          branchName={restaurants.find((r) => r.id === restaurantId)?.name ?? null}
        />
      )}

      {/* ── Vacaciones (admin only) ── */}
      {isManager && activeTab === 'vacaciones' && (
        <VacationsReport
          restaurantId={restaurantId}
          employees={visibleEmployees}
          refreshKey={reportRefreshKey}
        />
      )}

      {/* ── Employee Management (admin only) ── */}
      {isManager && activeTab === 'employees' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-primary">Gestión de Empleados</h2>
            {!showAddForm && (
              <button className="btn btn-primary flex items-center gap-2" onClick={startAdd}>
                <Plus size={16} /> Agregar empleado
              </button>
            )}
          </div>

          {newEmployeePasscode && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-5 flex items-start justify-between gap-4">
              <p className="text-sm">
                <strong>{newEmployeePasscode.name}</strong> fue dado de alta en el dispositivo Hikvision.
                Su PIN de acceso es <strong className="font-mono text-base">{newEmployeePasscode.passcode}</strong>.
                Compártelo con el empleado — no se volverá a mostrar.
              </p>
              <button
                type="button"
                className="text-green-700 hover:text-green-900"
                onClick={() => setNewEmployeePasscode(null)}
              >
                <X size={18} />
              </button>
            </div>
          )}

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
                  <th className="pb-3 w-8"></th>
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
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="animate-pulse bg-gray-200 rounded h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No hay empleados registrados.
                    </td>
                  </tr>
                ) : (
                  <DndContext
                    sensors={dndSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleEmployeeDragEnd}
                  >
                    <SortableContext
                      items={employees.map((e) => e.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {employees.map((emp) => (
                        <EmployeeRow
                          key={emp.id}
                          emp={emp}
                          onEdit={startEdit}
                          onDelete={handleDeleteEmployee}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Manual sync modal ── */}
      {manualSyncOpen && (
        <ManualSyncModal
          defaultAddress={restaurants.find((r) => r.id === restaurantId)?.hikvisionIp || undefined}
          onClose={() => setManualSyncOpen(false)}
          onConfirm={(address) => {
            setManualSyncOpen(false);
            handleSync(address);
          }}
        />
      )}
    </div>
  );
};

export default IncidenciasPage;
