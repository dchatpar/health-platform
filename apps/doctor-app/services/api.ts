import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authStore } from '@/store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          const refreshToken = await SecureStore.getItemAsync('refresh_token');

          if (refreshToken) {
            try {
              // Try to refresh token
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { token: newToken } = response.data;
              await SecureStore.setItemAsync('auth_token', newToken);

              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${newToken}`;
                return this.client.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, logout
              authStore.getState().clearAuth();
            }
          } else {
            // No refresh token, logout
            authStore.getState().clearAuth();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.get(url, config);
    return { data: response.data };
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.post(url, data, config);
    return { data: response.data };
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.put(url, data, config);
    return { data: response.data };
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.patch(url, data, config);
    return { data: response.data };
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.delete(url, config);
    return { data: response.data };
  }
}

export const api = new ApiService();
