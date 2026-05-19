import { UserRole, UserBranch } from './auth';

export type MinutaStatus = 'pending' | 'completed';

export interface MinutaGeneralInfo {
  date: string;
  startTime: string;
  endTime: string;
  lugar: string;
  evento: string;
  lugarOption?: string;
  customLugar?: string;
}

export interface MinutaArea {
  area: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  status?: MinutaStatus;
  encargadoUid?: string;
  encargadoUids?: string[];
  encargadoName?: string;
}

export interface MinutaAttendee {
  uid: string;
  displayName?: string;
  email?: string;
  area?: string;
}

export interface Minuta {
  id: string;
  supervisor?: string;
  branch?: UserBranch;
  role?: UserRole;
  whatHappened?: string;
  expectations?: string;
  nextMeetingDate?: Date;
  createdAt: Date;
  createdBy: string;
  eventId?: string;        // Legacy: single event reference (kept for existing docs)
  areaEventIds?: string[]; // One calendar event per area, parallel to areas[]
  status?: MinutaStatus;
  responsibleUids?: string[];
  generalInfo?: MinutaGeneralInfo;
  areas?: MinutaArea[];
  attendees?: MinutaAttendee[];
} 
