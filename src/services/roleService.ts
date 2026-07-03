import { RoleDefinition } from '../types/auth';
import { apiDelete, apiGet, apiPost } from './apiClient';

export const getRoles = async (): Promise<RoleDefinition[]> => {
  return apiGet<RoleDefinition[]>('/roles');
};

export const createRole = async (role: Omit<RoleDefinition, 'isSystem'>): Promise<void> => {
  await apiPost('/roles', role);
};

// The backend upserts on `value`, so updating a role's label/color reuses the same endpoint.
export const updateRole = async (role: Omit<RoleDefinition, 'isSystem'>): Promise<void> => {
  await apiPost('/roles', role);
};

export const deleteRole = async (value: string): Promise<void> => {
  await apiDelete(`/roles/${value}`);
};

// No-op: roles are seeded via the migration script
export const seedDefaultRoles = async (): Promise<void> => {};
