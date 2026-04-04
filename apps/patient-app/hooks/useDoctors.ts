import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Doctor, DoctorFilters } from '@/lib/types';

interface UseDoctorsOptions {
  filters?: DoctorFilters;
  page?: number;
  pageSize?: number;
}

export function useDoctors(options: UseDoctorsOptions = {}) {
  const { filters, page = 1, pageSize = 20 } = options;

  return useQuery({
    queryKey: ['doctors', filters, page, pageSize],
    queryFn: async () => {
      const response = await api.get<{ data: Doctor[]; total: number }>('/doctors', {
        params: { ...filters, page, pageSize },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDoctor(doctorId: string) {
  return useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      const response = await api.get<Doctor>(`/doctors/${doctorId}`);
      return response.data;
    },
    enabled: !!doctorId,
  });
}

export function useDoctorAvailability(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['doctor-availability', doctorId, date],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}/availability`, {
        params: { date },
      });
      return response.data;
    },
    enabled: !!doctorId && !!date,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      doctorId: string;
      scheduledDate: string;
      scheduledTime: string;
      type: 'in-person' | 'teleconsultation' | 'home-visit';
      reason: string;
    }) => {
      const response = await api.post('/appointments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDoctorReviews(doctorId: string) {
  return useQuery({
    queryKey: ['doctor-reviews', doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}/reviews`);
      return response.data;
    },
    enabled: !!doctorId,
  });
}
