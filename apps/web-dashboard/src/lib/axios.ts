import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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

  // Robust fallback: read directly from localStorage if Zustand rehydration hasn't completed in memory
  if (!token && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rsl-web-dashboard-auth');
      if (raw) {
        token = JSON.parse(raw).state?.tokens?.accessToken;
      }
    } catch (e) {}
  }

  // An explicit Authorization header (e.g. logout) wins over the stored session token.
  if (config.headers && token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Access tokens expire after ~15 minutes. Share one refresh between all requests that hit a 401.
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = (expiredToken?: string) => {
  refreshInFlight ??= useAuthStore
    .getState()
    .refreshAuth()
    .then((tokens) => {
      const fresh = tokens?.accessToken;
      // refreshAuth hands back the old token when the refresh itself fails, which means the session is over.
      if (!fresh || fresh === expiredToken) {
        useAuthStore.getState().clearAuth();
        return null;
      }
      return fresh;
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthEndpoint = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      const expired = String(original.headers?.Authorization ?? '').replace(/^Bearer /, '');
      const fresh = await refreshAccessToken(expired);
      if (fresh) {
        original.headers.Authorization = `Bearer ${fresh}`;
        return apiClient.request(original);
      }
    }

    // Attempt to unwrap standard backend error formats natively
    const data = error.response?.data as any;
    const message = data?.error?.message || data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
