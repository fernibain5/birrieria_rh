import { Resource, CreateResourceData } from '../types/resource';
import { apiDelete, apiGet, apiPatch, apiUpload } from './apiClient';

const toResource = (r: any): Resource => ({
  ...r,
  createdAt: r.createdAt ? new Date(r.createdAt) : null,
});

export const getResources = async (): Promise<Resource[]> => {
  const raw = await apiGet<any[]>('/resources');
  return raw.map(toResource);
};

export const uploadResource = async ({
  fileName,
  file,
  createdBy,
  adminOnly,
}: CreateResourceData): Promise<Resource> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName.trim());
  formData.append('adminOnly', String(adminOnly));
  formData.append('createdBy', createdBy);

  const raw = await apiUpload<any>('/resources', formData);
  return toResource(raw);
};

export const deleteResource = async (resource: Resource): Promise<void> => {
  await apiDelete(`/resources/${resource.id}`);
};

export const reorderResources = async (resources: Resource[]): Promise<void> => {
  await apiPatch('/resources/reorder', { ids: resources.map((r) => r.id) });
};
