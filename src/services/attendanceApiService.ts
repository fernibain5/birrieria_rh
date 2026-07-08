import {
  AttendanceRecord,
  PaginatedAttendance,
  SyncResult,
  AttendanceEmployee,
  AttendanceQuery,
  CreateEmployeeData,
  Restaurant,
  JustifiedAbsence,
} from '../types/Attendance';
import { getToken, clearToken } from './apiClient';

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
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return (body ? JSON.parse(body) : undefined) as T;
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

/** Fetch every record in the range — the API caps `limit` at 200 per page,
 *  so a single request can silently truncate busy periods. */
export async function getAllAttendance(
  restaurantId: number,
  query: Omit<AttendanceQuery, 'page' | 'limit'>,
): Promise<AttendanceRecord[]> {
  const records: AttendanceRecord[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await getAttendance(restaurantId, { ...query, page, limit: 200 });
    records.push(...res.data);
    totalPages = res.totalPages;
    page += 1;
  } while (page <= totalPages);

  return records;
}

export async function syncAttendance(restaurantId: number): Promise<SyncResult> {
  return apiFetch<SyncResult>(`/restaurants/${restaurantId}/attendance/sync`);
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

export async function reorderEmployees(restaurantId: number, ids: number[]): Promise<void> {
  await apiFetch<void>(`/restaurants/${restaurantId}/employees/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
}

// ─── Justified absences ─────────────────────────────────────────────────────

export async function getJustifiedAbsences(
  restaurantId: number,
  query: { startDate?: string; endDate?: string; employeeId?: number },
): Promise<JustifiedAbsence[]> {
  const qs = buildQuery({
    startDate: query.startDate,
    endDate: query.endDate,
    employeeId: query.employeeId,
  });
  return apiFetch<JustifiedAbsence[]>(`/restaurants/${restaurantId}/attendance/justified${qs}`);
}

export async function justifyAbsence(
  restaurantId: number,
  data: { employeeId: number; date: string; justifiedById?: string },
): Promise<JustifiedAbsence> {
  return apiFetch<JustifiedAbsence>(`/restaurants/${restaurantId}/attendance/justify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
