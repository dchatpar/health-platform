import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, Video, MapPin } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { Badge, StatusBadge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  onCancel?: () => void;
  className?: string;
}

const typeIconMap = {
  'in-person': <MapPin size={16} color="#6B7280" />,
  teleconsultation: <Video size={16} color="#4F46E5" />,
  'home-visit': <MapPin size={16} color="#10B981" />,
};

export function AppointmentCard({
  appointment,
  onPress,
  onCancel,
  className,
}: AppointmentCardProps) {
  const isUpcoming = ['scheduled', 'confirmed'].includes(appointment.status);
  const canCancel = isUpcoming && new Date(appointment.scheduledDate) > new Date();

  return (
    <Card onPress={onPress} className={cn('', className)}>
      <View className="flex-row gap-3 mb-3">
        {appointment.doctor && (
          <Avatar
            src={appointment.doctor.avatar}
            name={`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
            size="md"
          />
        )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {appointment.doctor
              ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
              : 'Doctor'}
          </Text>
          <Text className="text-sm text-primary-600">
            {appointment.doctor?.specialty.name || 'Specialist'}
          </Text>
        </View>
        <StatusBadge
          status={appointment.status}
          variant={
            appointment.status === 'completed'
              ? 'success'
              : appointment.status === 'cancelled'
              ? 'error'
              : 'primary'
          }
        />
      </View>

      <View className="flex-row items-center gap-4 mb-3">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600">
            {new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600">{appointment.scheduledTime}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-3">
        {typeIconMap[appointment.type]}
        <Text className="text-sm text-gray-600 capitalize">
          {appointment.type.replace('-', ' ')}
        </Text>
      </View>

      <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
        {appointment.reason}
      </Text>

      {canCancel && (
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={onCancel}
            className="px-4 py-2 rounded-lg"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-sm font-medium text-error-600">Cancel</Text>
          </TouchableOpacity>
          {appointment.type === 'teleconsultation' && (
            <Badge variant="primary">
              Join Consultation
            </Badge>
          )}
        </View>
      )}

      {appointment.status === 'completed' && appointment.prescription && (
        <View className="pt-3 border-t border-gray-100">
          <Badge variant="success">Prescription Added</Badge>
        </View>
      )}
    </Card>
  );
}
