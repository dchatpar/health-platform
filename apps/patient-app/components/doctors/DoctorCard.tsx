import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Star, Video, MapPin } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { cn } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  className?: string;
}

export function DoctorCard({ doctor, onPress, className }: DoctorCardProps) {
  return (
    <Card onPress={onPress} className={cn('', className)}>
      <View className="flex-row gap-4">
        <Avatar
          src={doctor.avatar}
          name={`${doctor.firstName} ${doctor.lastName}`}
          size="lg"
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-semibold text-gray-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </Text>
            {doctor.availableForTeleconsultation && (
              <Video size={16} color="#4F46E5" />
            )}
          </View>
          <Text className="text-sm text-primary-600 font-medium mb-1">
            {doctor.specialty.name}
          </Text>
          <View className="flex-row items-center gap-1 mb-2">
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-sm font-medium text-gray-900">
              {doctor.rating.toFixed(1)}
            </Text>
            <Text className="text-sm text-gray-500">
              ({doctor.reviewCount} reviews)
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <Text className="text-sm text-gray-600">
              {doctor.yearsOfExperience} years exp.
            </Text>
            <Text className="text-sm font-semibold text-primary-600">
              ${doctor.consultationFee}
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center gap-2">
        <MapPin size={14} color="#6B7280" />
        <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
          {doctor.clinic.name}, {doctor.clinic.address.city}
        </Text>
        <Badge variant="success" size="sm">
          Available Today
        </Badge>
      </View>
    </Card>
  );
}
