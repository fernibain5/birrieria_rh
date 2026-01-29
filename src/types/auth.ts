import { User } from 'firebase/auth';

export type UserRole = 'admin' | 'user' | 'mesero' | 'tortillero' | 'losero' | 'cocinero';
export type UserBranch = 'San Pedro' | 'Las Quintas';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  branch?: UserBranch;
  displayName?: string;
  phoneNumber?: string;
  allFiles?: string[];
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
} 