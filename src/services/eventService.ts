import { Event } from '../types/Event';
import { UserBranch, UserProfile } from '../types/auth';
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient';

// ─── Shape coming from the API ───────────────────────────────────────────────
interface ApiEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  color?: string;
  type?: 'holiday' | 'custom' | 'minuta';
  year?: number;
  createdAt?: string;
  createdBy?: string;
  targetRole?: string;
  targetBranch?: string;
  minutaId?: string;
}

const toEvent = (e: ApiEvent): Event => ({
  ...e,
  date: new Date(e.date),
  createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
});

// ─── Public API ──────────────────────────────────────────────────────────────

export const getAllEvents = async (): Promise<Event[]> => {
  const raw = await apiGet<ApiEvent[]>('/events');
  return raw.map(toEvent);
};

export const getEventsByYear = async (year: number): Promise<Event[]> => {
  const raw = await apiGet<ApiEvent[]>(`/events?year=${year}`);
  return raw.map(toEvent);
};

export const addEvent = async (event: Omit<Event, 'id'>): Promise<string> => {
  const { id } = await apiPost<{ id: string }>('/events', {
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    color: event.color,
    type: event.type,
    year: event.year ?? event.date.getFullYear(),
    createdBy: event.createdBy,
    targetRole: event.targetRole,
    targetBranch: event.targetBranch,
    minutaId: event.minutaId,
  });
  return id;
};

export const updateEvent = async (id: string, event: Partial<Event>): Promise<void> => {
  await apiPatch(`/events/${id}`, {
    title: event.title,
    description: event.description,
    date: event.date?.toISOString(),
    color: event.color,
    type: event.type,
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  await apiDelete(`/events/${id}`);
};

export const checkHolidaysExistForYear = async (
  year: number,
  branch: UserBranch,
): Promise<boolean> => {
  const { exists } = await apiGet<{ exists: boolean }>(
    `/events/holidays/check?year=${year}&branch=${encodeURIComponent(branch)}`,
  );
  return exists;
};

export const addMultipleEvents = async (events: Omit<Event, 'id'>[]): Promise<void> => {
  await Promise.all(events.map((e) => addEvent(e)));
};

export const filterEventsForUser = (events: Event[], userProfile: UserProfile): Event[] => {
  if (userProfile.role === 'admin') return events;
  return events.filter((event) => {
    if (event.type === 'minuta') {
      return event.targetRole === userProfile.role && event.targetBranch === userProfile.branch;
    }
    return !event.targetBranch || event.targetBranch === userProfile.branch;
  });
};

export const getEventsForUser = async (userProfile: UserProfile): Promise<Event[]> => {
  const all = await getAllEvents();
  return filterEventsForUser(all, userProfile);
};

export const getEventsByYearForUser = async (
  year: number,
  userProfile: UserProfile,
): Promise<Event[]> => {
  const all = await getEventsByYear(year);
  return filterEventsForUser(all, userProfile);
};
