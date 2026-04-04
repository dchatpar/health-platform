import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') as FilterType || 'all';

  const [selectedFilter, setSelectedFilter] = useState<FilterType>(initialFilter);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { appointments, isLoading, refetch, acceptAppointment, rejectAppointment } =
    useAppointments();

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === selectedFilter);
    }

    // Sort by date
    return filtered.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [appointments, selectedFilter]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, typeof appointments> = {};
    filteredAppointments.forEach((apt) => {
      const dateKey = format(parseISO(apt.scheduledAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [filteredAppointments]);

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

  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: 'gray' },
    { key: 'pending', label: 'Pending', color: 'warning' },
    { key: 'confirmed', label: 'Confirmed', color: 'primary' },
    { key: 'completed', label: 'Completed', color: 'success' },
    { key: 'cancelled', label: 'Cancelled', color: 'error' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Week Calendar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 7);
                setSelectedDate(prev);
              }}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedDate(new Date())}
              className="px-3 h-8 items-center justify-center bg-gray-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-gray-700">Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 7);
                setSelectedDate(next);
              }}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between">
          {weekDates.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                className={`items-center py-2 px-2 rounded-lg ${
                  isSelected ? 'bg-primary-100' : ''
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {format(date, 'EEE')}
                </Text>
                <Text
                  className={`text-lg font-semibold mt-1 ${
                    isSelected
                      ? 'text-primary-600'
                      : isToday
                      ? 'text-primary-500'
                      : 'text-gray-900'
                  }`}
                >
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-200"
        contentContainerClassName="px-4 py-3 gap-2"
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === filter.key
                ? 'bg-gray-900'
                : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedFilter === filter.key
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 items-center justify-center">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-gray-600 text-center font-medium">
              No appointments found
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              {selectedFilter !== 'all'
                ? `No ${selectedFilter} appointments`
                : 'No appointments scheduled'}
            </Text>
          </Card>
        ) : (
          Object.entries(appointmentsByDate).map(([dateKey, dateAppointments]) => (
            <View key={dateKey} className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">
                {format(parseISO(dateKey), 'EEEE, MMMM d')}
              </Text>
              {dateAppointments.map((appointment) => (
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
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
