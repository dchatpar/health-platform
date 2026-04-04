import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { TIME_SLOTS } from '@/lib/constants';

interface TimeSlotPickerProps {
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  availableSlots?: string[];
  className?: string;
}

export function TimeSlotPicker({
  selectedTime,
  onSelectTime,
  availableSlots = TIME_SLOTS,
  className,
}: TimeSlotPickerProps) {
  return (
    <View className={cn('', className)}>
      <View className="flex-row items-center gap-2 mb-3">
        <Clock size={18} color="#374151" />
        <Text className="text-base font-medium text-gray-900">Select Time</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {TIME_SLOTS.map((time) => {
          const isAvailable = availableSlots.includes(time);
          const isSelected = selectedTime === time;

          return (
            <TouchableOpacity
              key={time}
              onPress={() => isAvailable && onSelectTime(time)}
              disabled={!isAvailable}
              className={cn(
                'px-4 py-3 rounded-xl border min-w-[80px] items-center',
                isSelected
                  ? 'bg-primary-600 border-primary-600'
                  : isAvailable
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-100 border-gray-100 opacity-50'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-white' : isAvailable ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
