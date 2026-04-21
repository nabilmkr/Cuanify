import api from './api';
import { DashboardData } from '../types/api.types';

export const DashboardService = {
  get: async (month: number, year: number): Promise<DashboardData> => {
    const res = await api.get<{ status: string; data: DashboardData }>('/dashboard', {
      params: { month, year },
    });
    return res.data.data;
  },
};
