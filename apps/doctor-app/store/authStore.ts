import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  avatar?: string;
  isOnline: boolean;
  licenseNumber?: string;
  licenseVerified: boolean;
  bankingInfo?: {
    bankName?: string;
    accountNumber?: string;
  };
  schedule?: {
    isAvailable: boolean;
    startHour: number;
    endHour: number;
  }[];
}

interface AuthState {
  doctor: Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  setDoctor: (doctor: Doctor) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  clearAuth: () => void;
  updateDoctor: (updates: Partial<Doctor>) => void;
}

export const authStore = create<AuthState>()((set, get) => ({
  doctor: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setDoctor: (doctor) => {
    set({ doctor, isAuthenticated: !!doctor });
  },

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Try to get token from secure storage
      const token = await SecureStore.getItemAsync('auth_token');

      if (token) {
        set({ token, isAuthenticated: true });
        // Doctor data will be fetched by the useAuth hook
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  clearAuth: () => {
    set({
      doctor: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateDoctor: (updates) => {
    const currentDoctor = get().doctor;
    if (currentDoctor) {
      set({
        doctor: { ...currentDoctor, ...updates },
      });
    }
  },
}));

// Custom storage that uses AsyncStorage
const asyncStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  },
};
