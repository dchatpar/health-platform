import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

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

interface PatientInfoProps {
  patient: Patient;
  onViewHistory?: () => void;
}

export function PatientInfo({ patient, onViewHistory }: PatientInfoProps) {
  return (
    <View className="gap-4">
      {/* Basic Info */}
      <View className="flex-row items-center gap-4">
        <Avatar name={patient.name} source={patient.avatar} size="lg" />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {patient.name}
          </Text>
          <Text className="text-gray-600">
            {patient.age && `${patient.age} years old`}
            {patient.gender && ` • ${patient.gender}`}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View className="flex-row gap-4">
        {patient.phone && (
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-400">📞</Text>
            <Text className="text-gray-700">{patient.phone}</Text>
          </View>
        )}
        {patient.email && (
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-400">✉️</Text>
            <Text className="text-gray-700">{patient.email}</Text>
          </View>
        )}
      </View>

      {/* Medical Info */}
      <View className="flex-row flex-wrap gap-2">
        {patient.bloodType && (
          <Badge variant="error" size="md">
            Blood: {patient.bloodType}
          </Badge>
        )}
        {patient.allergies && (
          <Badge variant="warning" size="md">
            Allergies
          </Badge>
        )}
        {patient.conditions?.map((condition, index) => (
          <Badge key={index} variant="gray" size="md">
            {condition}
          </Badge>
        ))}
      </View>

      {/* Allergies Alert */}
      {patient.allergies && (
        <View className="p-3 bg-warning-50 rounded-lg border border-warning-200">
          <View className="flex-row items-center gap-2">
            <Text className="text-warning-600">⚠️</Text>
            <View>
              <Text className="text-warning-800 font-medium text-sm">
                Known Allergies
              </Text>
              <Text className="text-warning-700 text-sm">
                {patient.allergies}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* View History Button */}
      {onViewHistory && (
        <TouchableOpacity
          onPress={onViewHistory}
          className="flex-row items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg"
        >
          <Text className="text-primary-600 font-medium">
            View Medical History
          </Text>
          <Text className="text-primary-600">→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
