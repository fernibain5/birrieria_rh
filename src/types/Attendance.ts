export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  hikvisionId: string;
  department: string | null;
  checkedAt: string; // ISO string from API
  eventType: 'check-in' | 'check-out';
  deviceIp: string | null;
}

export interface PaginatedAttendance {
  data: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SyncResult {
  restaurantId: number;
  status: 'success' | 'error';
  recordsSynced: number;
  errorMessage?: string;
  syncedAt: string;
}

export interface AttendanceEmployee {
  id: number;
  restaurantId: number;
  hikvisionId: string;
  name: string;
  department: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Only present in the response right after creation — the device PIN. */
  passcode?: string;
}

export interface AttendanceQuery {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  page?: number;
  limit?: number;
}

export interface CreateEmployeeData {
  hikvisionId: string;
  name: string;
  department?: string;
  email?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  hikvisionIp: string;
  hikvisionUser: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
