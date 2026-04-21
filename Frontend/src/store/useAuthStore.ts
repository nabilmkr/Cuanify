/**
 * CUANIFY — Zustand Auth Store
 * Menyimpan token & user session di memory (+ AsyncStorage untuk persistensi)
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/api.types';

const TOKEN_KEY = 'cuanify_token';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (v: boolean) => void;
  logout: () => void;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setToken: async (token) => {
    set({ token });
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },

  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  loadToken: async () => {
    try {
      const saved = await AsyncStorage.getItem(TOKEN_KEY);
      set({ token: saved ?? null });
    } catch {
      set({ token: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

/**
 * Getter imperatif untuk digunakan di Axios interceptor
 * (di luar React component tree)
 */
export function getToken(): string | null {
  return useAuthStore.getState().token;
}
