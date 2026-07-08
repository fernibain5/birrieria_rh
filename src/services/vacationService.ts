import { VacationRequest } from '../types/Attendance';
import { apiGet, apiPost } from './apiClient';

export const getVacationRequests = async (restaurantId: number): Promise<VacationRequest[]> => {
  return apiGet<VacationRequest[]>(`/vacations?restaurantId=${restaurantId}`);
};

export const createVacationRequest = async (data: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<VacationRequest> => {
  return apiPost<VacationRequest>('/vacations', data);
};
