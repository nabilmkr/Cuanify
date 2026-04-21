import api from './api';
import { User } from '../types/api.types';

export const AuthService = {
  /** Verifikasi token & ambil data user */
  me: async (): Promise<User> => {
    const res = await api.get<{ status: string; data: User }>('/me');
    return res.data.data;
  },

  /** Logout — hapus token saat ini di server */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout').catch(() => {
      // Ignore network error saat logout — local state tetap di-clear
    });
  },
};
