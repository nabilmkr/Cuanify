import api from './api';
import { InsightData, CreateTransactionPayload, Transaction, Category } from '../types/api.types';

export const InsightService = {
  refresh: async (month: number, year: number): Promise<InsightData> => {
    const res = await api.post<{ status: string; data: InsightData }>(
      '/financial-insight/refresh',
      { month, year },
    );
    return res.data.data;
  },

  getHistory: async (month?: number, year?: number): Promise<InsightData[]> => {
    const res = await api.get<{ status: string; data: { items: InsightData[] } }>(
      '/financial-insight/history',
      { params: { month, year } },
    );
    return res.data.data.items;
  },
};

export const TransactionService = {
  list: async (): Promise<Transaction[]> => {
    const res = await api.get<{ status: string; data: Transaction[] }>('/transactions');
    return res.data.data;
  },

  create: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const res = await api.post<{ status: string; data: Transaction }>('/transactions', payload);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

export const CategoryService = {
  list: async (): Promise<Category[]> => {
    const res = await api.get<{ status: string; data: Category[] }>('/categories');
    return res.data.data;
  },
};
