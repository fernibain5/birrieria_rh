import { Minuta, MinutaArea, MinutaStatus } from '../types/Minuta';
import { UserProfile, UserRole, UserBranch } from '../types/auth';
import { apiGet, apiPatch, apiPost } from './apiClient';
import { getAllUsers } from './userService';
import { sendMinutaNotification, logMinutaNotification } from './whatsappService';

type CreateMinutaData = Omit<Minuta, 'id' | 'createdAt' | 'eventId'>;

// ─── Shape coming from the API ───────────────────────────────────────────────
interface ApiMinuta {
  id: string;
  supervisor?: string;
  branch?: string;
  role?: string;
  whatHappened?: string;
  expectations?: string;
  nextMeetingDate?: string;
  createdAt: string;
  createdBy: string;
  eventId?: string;
  areaEventIds?: string[];
  status?: MinutaStatus;
  responsibleUids?: string[];
  generalInfo?: Minuta['generalInfo'];
  areas?: MinutaArea[];
  attendees?: Minuta['attendees'];
}

const toMinuta = (m: ApiMinuta): Minuta => ({
  ...m,
  createdAt: new Date(m.createdAt),
  nextMeetingDate: m.nextMeetingDate ? new Date(m.nextMeetingDate) : undefined,
});

// ─── Public API ──────────────────────────────────────────────────────────────

export const createMinuta = async (
  minutaData: CreateMinutaData,
  createdBy: string,
): Promise<string> => {
  const { id } = await apiPost<{ id: string }>('/minutas', {
    ...minutaData,
    createdBy,
    nextMeetingDate: minutaData.nextMeetingDate?.toISOString(),
  });

  // WhatsApp notification stays browser-side (non-fatal)
  if (
    minutaData.nextMeetingDate &&
    minutaData.role &&
    minutaData.branch &&
    minutaData.supervisor &&
    minutaData.expectations
  ) {
    const targetUsers = await getUsersToNotify(minutaData.role, minutaData.branch);
    try {
      await sendMinutaNotification(
        minutaData.supervisor,
        minutaData.role,
        minutaData.branch,
        minutaData.nextMeetingDate,
        minutaData.expectations,
        targetUsers,
      );
    } catch {
      logMinutaNotification(
        minutaData.supervisor,
        minutaData.role,
        minutaData.branch,
        minutaData.nextMeetingDate,
        minutaData.expectations,
        targetUsers,
      );
    }
  }

  return id;
};

export const completeMinutaArea = async (
  minutaId: string,
  areaIndex: number,
  _userProfile: UserProfile,
): Promise<Minuta> => {
  const raw = await apiPatch<ApiMinuta>(`/minutas/${minutaId}/areas/${areaIndex}/complete`);
  return toMinuta(raw);
};

export const getAllMinutas = async (): Promise<Minuta[]> => {
  const raw = await apiGet<ApiMinuta[]>('/minutas');
  return raw.map(toMinuta);
};

export const getMinutasByRoleAndBranch = async (
  role: UserRole,
  branch: UserBranch,
): Promise<Minuta[]> => {
  const raw = await apiGet<ApiMinuta[]>(
    `/minutas?role=${encodeURIComponent(role)}&branch=${encodeURIComponent(branch)}`,
  );
  return raw.map(toMinuta);
};

export const getUsersToNotify = async (
  role: UserRole,
  branch: UserBranch,
): Promise<UserProfile[]> => {
  const allUsers = await getAllUsers();
  return allUsers.filter(
    (u) => u.role === 'admin' || (u.role === role && u.branch === branch),
  );
};
