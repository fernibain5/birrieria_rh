import { apiGet, apiPatch } from './apiClient';

export const getNavOrder = async (): Promise<string[]> => {
  const data = await apiGet<{ order: string[] }>('/nav-order');
  return data.order;
};

export const updateNavOrder = async (order: string[]): Promise<void> => {
  await apiPatch('/nav-order', { order });
};
