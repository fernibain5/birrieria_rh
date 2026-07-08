import { UserProfile, UserBranch, RestDay } from '../types/auth';
import { apiGet, apiPatch, apiPost } from './apiClient';

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: string;
  branch: UserBranch | '';
  phoneNumber: string;
  hireDate?: string;
  birthDate?: string;
  restDay: RestDay | '';
}

export const createUser = async (userData: CreateUserData): Promise<string> => {
  const profile = await apiPost<UserProfile>('/users', userData);
  return profile.uid;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  return apiGet<UserProfile[]>('/users');
};

export const getUserById = async (id: string): Promise<UserProfile> => {
  return apiGet<UserProfile>(`/users/${id}`);
};

export const updateUser = async (id: string, data: Partial<CreateUserData>): Promise<UserProfile> => {
  return apiPatch<UserProfile>(`/users/${id}`, data);
};

export const changeUserPassword = async (id: string, password: string): Promise<void> => {
  await apiPatch<UserProfile>(`/users/${id}`, { password });
};

export const linkEmployee = async (
  id: string,
  employeeId: number | null,
): Promise<UserProfile> => {
  return apiPatch<UserProfile>(`/users/${id}`, { employeeId });
};
