import { UserRole, UserBranch } from './auth';

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
  eventId?: string; // Reference to the created calendar event
  generalInfo?: MinutaGeneralInfo;
  areas?: MinutaArea[];
  attendees?: MinutaAttendee[];
} 
