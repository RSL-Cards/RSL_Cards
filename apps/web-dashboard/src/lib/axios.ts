import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { useAuthStore } from '@/stores/authStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  let token = useAuthStore.getState().tokens?.accessToken;
  let userId = useAuthStore.getState().user?.id;

  // Robust fallback: read directly from localStorage if Zustand rehydration hasn't completed in memory
  if ((!token || !userId) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rsl-web-dashboard-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!token) token = parsed.state?.tokens?.accessToken;
        if (!userId) userId = parsed.state?.user?.id;
      }
    } catch (e) {}
  }

  if (config.headers) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Attempt to unwrap standard backend error formats natively
    const data = error.response?.data as any;
    const message = data?.error?.message || data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
