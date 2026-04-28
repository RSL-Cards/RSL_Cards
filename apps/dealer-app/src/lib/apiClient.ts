import axios from "axios";
import { tokenStorage } from "./tokenStorage";
import { API_BASE_URL, ENDPOINTS } from "../config/api";
import { useAuthStore } from "../stores/authStore";

const BASE_URL = API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${BASE_URL}${ENDPOINTS.auth.refresh}`,
          {
            refreshToken,
          },
        );
        const { accessToken, refreshToken: newRefresh } = data.tokens;

        await tokenStorage.setTokens(accessToken, newRefresh);

        refreshQueue.forEach((cb) => cb(accessToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        await tokenStorage.clearTokens();
        useAuthStore.getState().clearAuth();
        refreshQueue = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
