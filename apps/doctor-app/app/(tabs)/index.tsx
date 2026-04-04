import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, isToday, parseISO } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export default function TodayScreen() {
  const router = useRouter();
  const { doctor } = useAuth();
  const { appointments, isLoading, refetch, acceptAppointment, rejectAppointment } =
    useAppointments();

  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.scheduledAt);
      return isToday(aptDate);
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return todayAppointments
      .filter((apt) => apt.status === 'confirmed' || apt.status === 'pending')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [todayAppointments]);

  const completedToday = useMemo(() => {
    return todayAppointments.filter((apt) => apt.status === 'completed').length;
  }, [todayAppointments]);

  const stats = useMemo(
    () => ({
      total: todayAppointments.length,
      completed: completedToday,
      pending: todayAppointments.filter((apt) => apt.status === 'pending').length,
      confirmed: todayAppointments.filter((apt) => apt.status === 'confirmed').length,
    }),
    [todayAppointments, completedToday]
  );

  const handleAppointmentPress = useCallback(
    (appointmentId: string) => {
      router.push(`/appointments/${appointmentId}`);
    },
    [router]
  );

  const handleStartConsultation = useCallback(
    (appointmentId: string) => {
      router.push(`/appointments/consultation/${appointmentId}`);
    },
    [router]
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-8"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* Welcome Section */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          Good {getTimeOfDay()}, Dr. {doctor?.name?.split(' ').pop() || 'Doctor'}
        </Text>
        <Text className="text-gray-600 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Text>
      </View>

      {/* Quick Stats */}
      <View className="flex-row gap-3 mb-6">
        <Card className="flex-1 p-4 bg-primary-50 border-0">
          <Text className="text-primary-600 text-2xl font-bold">
            {stats.total}
          </Text>
          <Text className="text-primary-700 text-sm mt-1">Total Today</Text>
        </Card>
        <Card className="flex-1 p-4 bg-success-50 border-0">
          <Text className="text-success-600 text-2xl font-bold">
            {stats.completed}
          </Text>
          <Text className="text-success-700 text-sm mt-1">Completed</Text>
        </Card>
        <Card className="flex-1 p-4 bg-warning-50 border-0">
          <Text className="text-warning-600 text-2xl font-bold">
            {stats.pending}
          </Text>
          <Text className="text-warning-700 text-sm mt-1">Pending</Text>
        </Card>
      </View>

      {/* Pending Approvals */}
      {stats.pending > 0 && (
        <Card className="p-4 mb-6 border-warning-200 bg-warning-50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-warning-100 items-center justify-center">
                <Text className="text-lg">⏳</Text>
              </View>
              <View>
                <Text className="font-semibold text-warning-800">
                  {stats.pending} Pending Approvals
                </Text>
                <Text className="text-sm text-warning-700">
                  Review and accept appointments
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/appointments?filter=pending')}
            >
              <Text className="text-warning-600 font-medium">View</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">
            Upcoming Appointments
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
            <Text className="text-primary-600 font-medium text-sm">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointments.length === 0 ? (
          <Card className="p-8 items-center justify-center">
            <Text className="text-4xl mb-3">📅</Text>
            <Text className="text-gray-600 text-center">
              No upcoming appointments today
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              Enjoy your day off or check tomorrow's schedule
            </Text>
          </Card>
        ) : (
          upcomingAppointments.slice(0, 3).map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={() => handleAppointmentPress(appointment.id)}
              onStartConsultation={
                appointment.status === 'confirmed'
                  ? () => handleStartConsultation(appointment.id)
                  : undefined
              }
              onAccept={
                appointment.status === 'pending'
                  ? () => acceptAppointment(appointment.id)
                  : undefined
              }
              onReject={
                appointment.status === 'pending'
                  ? () => rejectAppointment(appointment.id)
                  : undefined
              }
              showActions={appointment.status === 'pending'}
            />
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Quick Actions
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 p-4 bg-white rounded-xl border border-gray-200 items-center"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text className="text-2xl mb-2">📋</Text>
            <Text className="text-sm font-medium text-gray-700">
              My Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 p-4 bg-white rounded-xl border border-gray-200 items-center"
            onPress={() => router.push('/earnings')}
          >
            <Text className="text-2xl mb-2">💳</Text>
            <Text className="text-sm font-medium text-gray-700">
              Withdraw
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 p-4 bg-white rounded-xl border border-gray-200 items-center"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text className="text-2xl mb-2">⚙️</Text>
            <Text className="text-sm font-medium text-gray-700">Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
