import { OrgChart } from '../types/orgChart';
import { apiDelete, apiGet, apiUpload } from './apiClient';

interface RawOrgChart extends Omit<OrgChart, 'createdAt'> {
  createdAt: string | null;
}

const toOrgChart = (o: RawOrgChart): OrgChart => ({
  ...o,
  createdAt: o.createdAt ? new Date(o.createdAt) : null,
});

export const getOrgChart = async (): Promise<OrgChart | null> => {
  const raw = await apiGet<RawOrgChart | null>('/org-chart');
  return raw ? toOrgChart(raw) : null;
};

export const uploadOrgChart = async (file: File): Promise<OrgChart> => {
  const formData = new FormData();
  formData.append('file', file);

  const raw = await apiUpload<RawOrgChart>('/org-chart', formData);
  return toOrgChart(raw);
};

export const deleteOrgChart = async (): Promise<void> => {
  await apiDelete('/org-chart');
};
