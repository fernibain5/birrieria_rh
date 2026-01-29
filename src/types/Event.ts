import { UserRole, UserBranch } from './auth';

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  color?: string;
  type?: 'holiday' | 'custom' | 'minuta'; // Added 'minuta' type
  year?: number; // For tracking which year the holiday applies to
  createdAt?: Date;
  createdBy?: string; // User ID who created the event (for custom events)
  // Fields for targeting specific users for minuta events
  targetRole?: UserRole; // Only users with this role can see this event
  targetBranch?: UserBranch; // Only users from this branch can see this event
  minutaId?: string; // Reference to the minuta that created this event
}