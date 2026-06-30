import {
  PaginatedAttendance,
  SyncResult,
  AttendanceEmployee,
  AttendanceQuery,
  CreateEmployeeData,
  Restaurant,
} from '../types/Attendance';

const BASE = import.meta.env.VITE_API_URL as string;

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── Restaurants ─────────────────────────────────────────────────────────────

export async function getRestaurants(): Promise<Restaurant[]> {
  return apiFetch<Restaurant[]>('/restaurants');
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function getAttendance(
  restaurantId: number,
  query: AttendanceQuery,
): Promise<PaginatedAttendance> {
  const qs = buildQuery({
    startDate: query.startDate,
    endDate: query.endDate,
    employeeId: query.employeeId,
    page: query.page,
    limit: query.limit,
  });
  return apiFetch<PaginatedAttendance>(`/restaurants/${restaurantId}/attendance${qs}`);
}

export async function syncAttendance(restaurantId: number): Promise<SyncResult> {
  return apiFetch<SyncResult>(`/restaurants/${restaurantId}/attendance/sync`);
}

export async function downloadAttendanceCsv(
  restaurantId: number,
  query: Omit<AttendanceQuery, 'page' | 'limit'>,
): Promise<void> {
  const qs = buildQuery({
    startDate: query.startDate,
    endDate: query.endDate,
    employeeId: query.employeeId,
  });

  const res = await fetch(
    `${BASE}/restaurants/${restaurantId}/attendance/download${qs}`,
  );
  if (!res.ok) throw new Error(`CSV download failed: ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asistencia_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function getEmployees(restaurantId: number): Promise<AttendanceEmployee[]> {
  return apiFetch<AttendanceEmployee[]>(`/restaurants/${restaurantId}/employees`);
}

export async function createEmployee(
  restaurantId: number,
  data: CreateEmployeeData,
): Promise<AttendanceEmployee> {
  return apiFetch<AttendanceEmployee>(`/restaurants/${restaurantId}/employees`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(
  restaurantId: number,
  id: number,
  data: Partial<CreateEmployeeData>,
): Promise<AttendanceEmployee> {
  return apiFetch<AttendanceEmployee>(`/restaurants/${restaurantId}/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(
  restaurantId: number,
  id: number,
): Promise<AttendanceEmployee> {
  return apiFetch<AttendanceEmployee>(`/restaurants/${restaurantId}/employees/${id}`, {
    method: 'DELETE',
  });
}
