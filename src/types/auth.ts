export type UserRole = string;
export type UserBranch = 'San Pedro' | 'Las Quintas';

export interface RoleDefinition {
  value: string;
  label: string;
  color: string;
  isSystem: boolean;
}

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
  currentUser: { uid: string } | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}
