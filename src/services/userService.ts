import { UserProfile, UserBranch } from '../types/auth';
import { apiGet, apiPatch, apiPost } from './apiClient';

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: string;
  branch: UserBranch;
  phoneNumber: string;
}

export const createUser = async (userData: CreateUserData): Promise<string> => {
  const profile = await apiPost<UserProfile>('/users', userData);
  return profile.uid;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  return apiGet<UserProfile[]>('/users');
};

export const updateUser = async (id: string, data: Partial<CreateUserData>): Promise<UserProfile> => {
  return apiPatch<UserProfile>(`/users/${id}`, data);
};
