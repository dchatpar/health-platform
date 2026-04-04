import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface TimeSlotEditorProps {
  startHour: number;
  endHour: number;
  onStartChange: (hour: number) => void;
  onEndChange: (hour: number) => void;
  interval?: number; // in minutes
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TimeSlotEditor({
  startHour,
  endHour,
  onStartChange,
  onEndChange,
  interval = 30,
}: TimeSlotEditorProps) {
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const generateTimeSlots = () => {
    const slots: { hour: number; minute: number; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += interval) {
        slots.push({
          hour: h,
          minute: m,
          label: `${formatHour(h).replace(':00 AM', '').replace(':00 PM', '')}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`,
        });
      }
    }
    return slots;
  };

  const slots = generateTimeSlots();

  return (
    <View className="gap-4">
      <View className="flex-row gap-4">
        {/* Start Time */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">Start Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {HOURS.slice(6, 20).map((hour) => (
              <TouchableOpacity
                key={`start-${hour}`}
                onPress={() => onStartChange(hour)}
                className={`px-3 py-2 rounded-lg mr-2 ${
                  startHour === hour
                    ? 'bg-primary-500'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm ${
                    startHour === hour ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {formatHour(hour)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View className="flex-row gap-4">
        {/* End Time */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">End Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {HOURS.slice(8, 22).map((hour) => (
              <TouchableOpacity
                key={`end-${hour}`}
                onPress={() => onEndChange(hour)}
                className={`px-3 py-2 rounded-lg mr-2 ${
                  endHour === hour
                    ? 'bg-primary-500'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm ${
                    endHour === hour ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {formatHour(hour)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Duration Display */}
      <View className="p-3 bg-gray-50 rounded-lg">
        <Text className="text-sm text-gray-600">
          Slot Duration:{' '}
          <Text className="font-semibold text-gray-900">
            {endHour - startHour} hours
          </Text>
        </Text>
      </View>
    </View>
  );
}

function Text({ className, children }: { className?: string; children: React.ReactNode }) {
  return <>{children}</>;
}
