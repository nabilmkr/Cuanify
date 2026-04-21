import api from './api';
import { TrendData, CategoryDistributionData } from '../types/api.types';

export type AnalyticsRange = 'week' | 'month' | 'year';

export const AnalyticsService = {
  getTrend: async (
    range: AnalyticsRange,
    month: number,
    year: number,
  ): Promise<TrendData> => {
    const res = await api.get<{ status: string; data: TrendData }>(
      '/analytics/trend',
      { params: { range, month, year } },
    );
    return res.data.data;
  },

  getCategoryDistribution: async (
    range: AnalyticsRange,
    month: number,
    year: number,
  ): Promise<CategoryDistributionData> => {
    const res = await api.get<{ status: string; data: CategoryDistributionData }>(
      '/analytics/category-distribution',
      { params: { range, month, year } },
    );
    return res.data.data;
  },
};
