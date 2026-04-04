import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Appointment {
  id: string;
  patient: {
    id: string;
    name: string;
    avatar?: string;
    age?: number;
    gender?: string;
  };
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type?: string;
  duration?: number;
  reason?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  onStartConsultation?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function AppointmentCard({
  appointment,
  onPress,
  onStartConsultation,
  onAccept,
  onReject,
  showActions = false,
}: AppointmentCardProps) {
  const appointmentDate = parseISO(appointment.scheduledAt);
  const isUpcoming = !isPast(appointmentDate);
  const isAppointmentToday = isToday(appointmentDate);

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="primary" size="sm">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="error" size="sm">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="error" size="sm">No Show</Badge>;
      default:
        return <Badge variant="gray" size="sm">{appointment.status}</Badge>;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="p-4 mb-3">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-3">
            <Avatar
              name={appointment.patient?.name}
              source={appointment.patient?.avatar}
              size="md"
            />
            <View>
              <Text className="font-semibold text-gray-900">
                {appointment.patient?.name || 'Patient'}
              </Text>
              <Text className="text-sm text-gray-500">
                {appointment.patient?.age && `${appointment.patient.age} years`}
                {appointment.patient?.gender && ` • ${appointment.patient.gender}`}
              </Text>
            </View>
          </View>
          {getStatusBadge()}
        </View>

        <View className="flex-row items-center gap-4 mb-3">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-gray-400">🕐</Text>
            <Text className="text-sm text-gray-600">
              {format(appointmentDate, 'h:mm a')}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-gray-400">📹</Text>
            <Text className="text-sm text-gray-600">
              {appointment.type || 'Video Call'}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-gray-400">⏱</Text>
            <Text className="text-sm text-gray-600">
              {appointment.duration || 30} min
            </Text>
          </View>
        </View>

        {appointment.reason && (
          <Text
            className="text-sm text-gray-600 mb-3 line-clamp-2"
            numberOfLines={2}
          >
            {appointment.reason}
          </Text>
        )}

        {/* Today's indicator */}
        {isAppointmentToday && appointment.status !== 'completed' && (
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-2 h-2 rounded-full bg-primary-500" />
            <Text className="text-sm text-primary-600 font-medium">Today</Text>
          </View>
        )}

        {/* Action Buttons */}
        {showActions && onAccept && onReject && (
          <View className="flex-row gap-3 mt-2">
            <Button
              variant="outline"
              onPress={(e) => {
                e.stopPropagation();
                onReject();
              }}
              className="flex-1 h-10 border-error-200"
            >
              <Text className="text-error-600 font-medium text-sm">Decline</Text>
            </Button>
            <Button
              onPress={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              className="flex-1 h-10"
            >
              <Text className="text-white font-medium text-sm">Accept</Text>
            </Button>
          </View>
        )}

        {/* Start Consultation Button */}
        {appointment.status === 'confirmed' && isUpcoming && onStartConsultation && (
          <Button
            onPress={(e) => {
              e.stopPropagation();
              onStartConsultation();
            }}
            className="h-10 mt-2 bg-success-600"
          >
            <Text className="text-white font-medium text-sm">Start Consultation</Text>
          </Button>
        )}
      </Card>
    </TouchableOpacity>
  );
}
