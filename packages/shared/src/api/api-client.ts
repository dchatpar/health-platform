// API Client

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
}

export interface RequestInterceptor {
  onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onRejected?: (error: unknown) => unknown;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onRejected?: (error: unknown) => unknown;
}

export interface ApiError extends Error {
  config: AxiosRequestConfig;
  request?: unknown;
  response?: AxiosResponse<ApiErrorResponse>;
  isAxiosError: boolean;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedApiResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

function createApiClient(config: ApiClientConfig): AxiosInstance {
  // Dynamically import axios only when needed (peer dependency)
  let axios: typeof import('axios').default;

  const getAxios = async () => {
    if (!axios) {
      try {
        axios = (await import('axios')).default;
      } catch {
        throw new Error('Axios is not installed. Please install axios: npm install axios');
      }
    }
    return axios;
  };

  let instance: AxiosInstance | null = null;

  const getInstance = async (): Promise<AxiosInstance> => {
    if (instance) return instance;

    const ax = await getAxios();
    instance = ax.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      withCredentials: config.withCredentials ?? true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    instance.interceptors.request.use(
      (config) => {
        // Skip if we're in a SSR context without window
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling and token refresh
    instance.interceptors.response.use(
      (response) => response,
      async (error: ApiError) => {
        const originalRequest = error.config;

        // Handle 401 errors by attempting token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const ax = await getAxios();
              const response = await ax.post(`${config.baseURL}/auth/refresh`, { refreshToken });

              const { accessToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return instance!.request(originalRequest);
            }
          } catch {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  };

  return {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      const ax = await getInstance();
      return ax.get<T>(url, config);
    },
    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      const ax = await getInstance();
      return ax.post<T>(url, data, config);
    },
    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      const ax = await getInstance();
      return ax.put<T>(url, data, config);
    },
    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      const ax = await getInstance();
      return ax.patch<T>(url, data, config);
    },
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      const ax = await getInstance();
      return ax.delete<T>(url, config);
    },
    async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
      const ax = await getInstance();
      return ax.request<T>(config);
    },
  } as unknown as AxiosInstance;
}

// Factory function to create API client
export function createApiClientFactory() {
  return {
    create: createApiClient,
  };
}

// Default API client instance (can be configured once)
let defaultClient: ReturnType<typeof createApiClient> | null = null;

export function initApiClient(config: ApiClientConfig): ReturnType<typeof createApiClient> {
  defaultClient = createApiClient(config);
  return defaultClient;
}

export function getApiClient(): ReturnType<typeof createApiClient> | null {
  return defaultClient;
}

// Helper function to check if error is an API error
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as ApiError).isAxiosError === true
  );
}

// Helper function to extract error message from API error
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Helper function to extract validation errors from API error
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (isApiError(error)) {
    if (error.response?.data?.error?.details) {
      return error.response.data.error.details;
    }
  }
  return {};
}
