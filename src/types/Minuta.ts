import { UserRole, UserBranch } from './auth';

export interface Minuta {
  id: string;
  supervisor: string;
  branch: UserBranch;
  role: UserRole;
  whatHappened: string;
  expectations: string;
  nextMeetingDate: Date;
  createdAt: Date;
  createdBy: string;
  eventId?: string; // Reference to the created calendar event
} 