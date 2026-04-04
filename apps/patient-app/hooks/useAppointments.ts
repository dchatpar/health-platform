import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Appointment } from '@/lib/types';

interface UseAppointmentsOptions {
  status?: Appointment['status'];
  page?: number;
  pageSize?: number;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { status, page = 1, pageSize = 20 } = options;

  return useQuery({
    queryKey: ['appointments', status, page, pageSize],
    queryFn: async () => {
      const response = await api.get<{ items: Appointment[]; total: number }>(
        '/appointments',
        {
          params: { status, page, pageSize },
        }
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await api.get<Appointment>(`/appointments/${appointmentId}`);
      return response.data;
    },
    enabled: !!appointmentId,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { appointmentId: string; reason?: string }) => {
      const response = await api.post(`/appointments/${data.appointmentId}/cancel`, {
        reason: data.reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const response = await api.get<Appointment[]>('/appointments/upcoming');
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
