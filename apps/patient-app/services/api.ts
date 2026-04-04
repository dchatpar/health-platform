import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/lib/constants';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout
          useAuthStore.getState().clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  }
}

export const api = new ApiClient();

// API endpoint helpers
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',

  // User
  user: '/users/me',
  updateProfile: '/users/me',
  changePassword: '/users/me/change-password',

  // Doctors
  doctors: '/doctors',
  doctor: (id: string) => `/doctors/${id}`,
  doctorAvailability: (id: string) => `/doctors/${id}/availability`,
  doctorReviews: (id: string) => `/doctors/${id}/reviews`,

  // Appointments
  appointments: '/appointments',
  appointment: (id: string) => `/appointments/${id}`,
  cancelAppointment: (id: string) => `/appointments/${id}/cancel`,
  upcomingAppointments: '/appointments/upcoming',

  // Consultations
  consultations: '/consultations',
  consultation: (id: string) => `/consultations/${id}`,
  consultationNotes: (id: string) => `/consultations/${id}/notes`,
  joinConsultation: (id: string) => `/consultations/${id}/join`,

  // Pharmacy
  pharmacies: '/pharmacies',
  pharmacy: (id: string) => `/pharmacies/${id}`,
  pharmacyOrders: '/pharmacy/orders',
  pharmacyOrder: (id: string) => `/pharmacy/orders/${id}`,

  // Medical Records
  medicalRecords: '/medical-records',
  medicalRecord: (id: string) => `/medical-records/${id}`,

  // Wallet
  wallet: '/wallet',
  walletTransactions: '/wallet/transactions',
  addFunds: '/wallet/add-funds',
  withdraw: '/wallet/withdraw',

  // Payments
  payments: '/payments',
  initiatePayment: '/payments/initiate',

  // Reviews
  reviews: '/reviews',
  createReview: '/reviews',
};
