import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { format, parseISO, formatDistanceToNow, isPast } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { PatientInfo } from '@/components/appointments/PatientInfo';
import { AcceptRejectButtons } from '@/components/appointments/AcceptRejectButtons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, acceptAppointment, rejectAppointment, completeAppointment } =
    useAppointments();
  const { getPatientHistory } = usePatients();

  const appointment = useMemo(() => {
    return getAppointmentById(id);
  }, [id, getAppointmentById]);

  const patientHistory = useMemo(() => {
    if (!appointment?.patientId) return [];
    return getPatientHistory(appointment.patientId);
  }, [appointment?.patientId, getPatientHistory]);

  const handleAccept = useCallback(async () => {
    try {
      await acceptAppointment(id);
      Alert.alert('Success', 'Appointment accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to accept appointment');
    }
  }, [id, acceptAppointment]);

  const handleReject = useCallback(async () => {
    Alert.alert(
      'Reject Appointment',
      'Are you sure you want to reject this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectAppointment(id);
              Alert.alert('Success', 'Appointment rejected');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to reject appointment');
            }
          },
        },
      ]
    );
  }, [id, rejectAppointment, router]);

  const handleStartConsultation = useCallback(() => {
    router.push(`/appointments/consultation/${id}`);
  }, [id, router]);

  const handleMarkComplete = useCallback(async () => {
    try {
      await completeAppointment(id);
      Alert.alert('Success', 'Appointment marked as complete');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to complete appointment');
    }
  }, [id, completeAppointment, router]);

  if (!appointment) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Appointment not found</Text>
      </View>
    );
  }

  const appointmentDate = parseISO(appointment.scheduledAt);
  const isUpcoming = !isPast(appointmentDate);
  const timeUntil = formatDistanceToNow(appointmentDate, { addSuffix: true });

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'pending':
        return <Badge variant="warning" size="md">Pending Review</Badge>;
      case 'confirmed':
        return <Badge variant="primary" size="md">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="success" size="md">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="error" size="md">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="error" size="md">No Show</Badge>;
      default:
        return <Badge variant="gray" size="md">{appointment.status}</Badge>;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Appointment Details',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerClassName="p-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Card className="p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            {getStatusBadge()}
            <Text className="text-gray-500 text-sm">
              {timeUntil}
            </Text>
          </View>

          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-xl">📅</Text>
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-900">
                {format(appointmentDate, 'EEEE')}
              </Text>
              <Text className="text-gray-600">
                {format(appointmentDate, 'MMMM d, yyyy')} at{' '}
                {format(appointmentDate, 'h:mm a')}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 py-2 px-3 bg-gray-50 rounded-lg">
              <Text className="text-xs text-gray-500">Type</Text>
              <Text className="text-sm font-medium text-gray-900 capitalize">
                {appointment.type || 'Video Call'}
              </Text>
            </View>
            <View className="flex-1 py-2 px-3 bg-gray-50 rounded-lg">
              <Text className="text-xs text-gray-500">Duration</Text>
              <Text className="text-sm font-medium text-gray-900">
                {appointment.duration || 30} min
              </Text>
            </View>
          </View>
        </Card>

        {/* Patient Info */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Patient Information
          </Text>
          <PatientInfo
            patient={appointment.patient}
            onViewHistory={() =>
              router.push(`/patients/${appointment.patientId}/history`)
            }
          />
        </Card>

        {/* Appointment Reason */}
        {appointment.reason && (
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Reason for Visit
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              {appointment.reason}
            </Text>
          </Card>
        )}

        {/* Medical History Summary */}
        {patientHistory.length > 0 && (
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Recent History
            </Text>
            <View className="gap-3">
              {patientHistory.slice(0, 3).map((record, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-start py-2 border-b border-gray-100 last:border-0"
                >
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {record.condition || 'Consultation'}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {format(parseISO(record.date), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <Badge variant="gray" size="sm">
                    {record.status || 'Resolved'}
                  </Badge>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Notes */}
        {appointment.notes && (
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Notes
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              {appointment.notes}
            </Text>
          </Card>
        )}

        {/* Actions */}
        <View className="gap-3">
          {appointment.status === 'pending' && (
            <AcceptRejectButtons
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}

          {appointment.status === 'confirmed' && isUpcoming && (
            <Button
              onPress={handleStartConsultation}
              className="h-12"
            >
              <Text className="text-white font-semibold">Start Consultation</Text>
            </Button>
          )}

          {appointment.status === 'confirmed' && !isUpcoming && (
            <Button
              onPress={handleMarkComplete}
              className="h-12 bg-success-600"
            >
              <Text className="text-white font-semibold">Mark as Complete</Text>
            </Button>
          )}

          <Button
            variant="outline"
            onPress={() => router.back()}
            className="h-12"
          >
            <Text className="text-gray-700 font-semibold">Go Back</Text>
          </Button>
        </View>

        {/* No-Show Warning */}
        {appointment.status === 'confirmed' && isPast(appointmentDate) && (
          <Card className="p-4 mt-4 bg-warning-50 border-warning-200">
            <View className="flex-row items-start gap-3">
              <Text className="text-xl">⚠️</Text>
              <View className="flex-1">
                <Text className="text-warning-800 font-semibold">
                  Appointment Time Passed
                </Text>
                <Text className="text-warning-700 text-sm mt-1">
                  If the patient did not show up, you can mark them as no-show
                  after 15 minutes.
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
