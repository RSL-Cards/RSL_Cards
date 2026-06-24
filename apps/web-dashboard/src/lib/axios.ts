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
  const state = useAuthStore.getState();
  const token = state.tokens?.accessToken;
  const userId = state.user?.id;
  
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
