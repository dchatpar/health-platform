import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { format, parseISO, addMinutes, isPast } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string[];
}

interface Appointment {
  id: string;
  patient: Patient;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type?: string;
  duration?: number;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function useAppointments() {
  const queryClient = useQueryClient();

  // Fetch all appointments
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      return response.data as Appointment[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get appointment by ID
  const getAppointmentById = useCallback(
    (id: string) => {
      return appointments.find((apt) => apt.id === id);
    },
    [appointments]
  );

  // Accept appointment mutation
  const acceptAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.patch(`/appointments/${appointmentId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const acceptAppointment = useCallback(
    async (appointmentId: string) => {
      await acceptAppointmentMutation.mutateAsync(appointmentId);
    },
    [acceptAppointmentMutation]
  );

  // Reject appointment mutation
  const rejectAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.patch(`/appointments/${appointmentId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const rejectAppointment = useCallback(
    async (appointmentId: string) => {
      await rejectAppointmentMutation.mutateAsync(appointmentId);
    },
    [rejectAppointmentMutation]
  );

  // Complete appointment mutation
  const completeAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.patch(`/appointments/${appointmentId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
    },
  });

  const completeAppointment = useCallback(
    async (appointmentId: string) => {
      await completeAppointmentMutation.mutateAsync(appointmentId);
    },
    [completeAppointmentMutation]
  );

  // Mark as no-show mutation
  const markNoShowMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.patch(`/appointments/${appointmentId}/no-show`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const markAsNoShow = useCallback(
    async (appointmentId: string) => {
      await markNoShowMutation.mutateAsync(appointmentId);
    },
    [markNoShowMutation]
  );

  // Auto-mark no-show for appointments 15+ minutes past
  const checkNoShows = useCallback(() => {
    const now = new Date();
    appointments.forEach((apt) => {
      if (apt.status === 'confirmed') {
        const scheduledTime = parseISO(apt.scheduledAt);
        const endTime = addMinutes(scheduledTime, apt.duration || 30);
        if (isPast(endTime) && addMinutes(endTime, 15) < now) {
          markAsNoShow(apt.id);
        }
      }
    });
  }, [appointments, markAsNoShow]);

  // Update appointment notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes: string }) => {
      const response = await api.patch(`/appointments/${appointmentId}/notes`, { notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateNotes = useCallback(
    async (appointmentId: string, notes: string) => {
      await updateNotesMutation.mutateAsync({ appointmentId, notes });
    },
    [updateNotesMutation]
  );

  return {
    appointments,
    isLoading,
    refetch,
    getAppointmentById,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
    markAsNoShow,
    checkNoShows,
    updateNotes,
    isAccepting: acceptAppointmentMutation.isPending,
    isRejecting: rejectAppointmentMutation.isPending,
    isCompleting: completeAppointmentMutation.isPending,
  };
}
