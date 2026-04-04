import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authStore } from '@/store/authStore';
import { api } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

interface LoginCredentials {
  email: string;
  password: string;
}

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

export function useAuth() {
  const queryClient = useQueryClient();
  const {
    doctor,
    isAuthenticated,
    isLoading: storeLoading,
    setDoctor,
    setToken,
    clearAuth,
  } = authStore();

  // Fetch current doctor profile
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data as Doctor;
      } catch (error) {
        // If API fails, return null (user might be logged out)
        return null;
      }
    },
    enabled: isAuthenticated,
    retry: 1,
  });

  // Update store when profile is fetched
  useEffect(() => {
    if (profileData) {
      setDoctor(profileData);
    }
  }, [profileData, setDoctor]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    onSuccess: async (data) => {
      const { token, doctor: doctorData } = data;

      // Store token securely
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken || '');

      // Update store
      setToken(token);
      setDoctor(doctorData);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }

    // Clear secure storage
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');

    // Clear store
    clearAuth();

    // Invalidate all queries
    queryClient.clear();
  }, [clearAuth, queryClient]);

  const updateProfile = useCallback(
    async (updates: Partial<Doctor>) => {
      const response = await api.put('/auth/profile', updates);
      const updatedDoctor = response.data as Doctor;
      setDoctor(updatedDoctor);
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
      return updatedDoctor;
    },
    [setDoctor, queryClient]
  );

  const updateSchedule = useCallback(
    async (schedule: Doctor['schedule']) => {
      await api.put('/auth/profile', { schedule });
      setDoctor({ ...doctor, schedule });
      return schedule;
    },
    [doctor, setDoctor]
  );

  return {
    doctor: doctor || profileData,
    isLoading: storeLoading || isProfileLoading || loginMutation.isPending,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    updateSchedule,
  };
}
