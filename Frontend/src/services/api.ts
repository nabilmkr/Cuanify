/**
 * CUANIFY — Axios API Client
 *
 * Base URL otomatis disesuaikan:
 * - Expo Go di device fisik → IP komputer di LAN
 * - Emulator Android → 10.0.2.2 (alias localhost dari emulator)
 *
 * Ubah BASE_URL sesuai IP komputer Anda saat development.
 */
import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../store/useAuthStore';

// ─── Konfigurasi Base URL ─────────────────────────────────────────────────────
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000/api';
  }
  // Untuk emulator Android dari lokal: "http://10.0.2.2:8000/api"
  // Jika pakai device fisik (HP), ganti return ini dengan IP Wi-Fi PC Anda
  return 'http://10.0.2.2:8000/api';
};

export const BASE_URL = getBaseUrl();

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: Inject Bearer Token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Normalize Errors ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ambil pesan error dari response Laravel jika ada
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Terjadi kesalahan. Coba lagi.';
    return Promise.reject(new Error(message));
  },
);

export default api;
