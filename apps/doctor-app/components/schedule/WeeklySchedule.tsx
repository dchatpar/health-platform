import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Button } from '@/components/ui/Button';

interface DaySchedule {
  isAvailable: boolean;
  startHour: number;
  endHour: number;
}

interface WeeklyScheduleProps {
  schedule?: DaySchedule[];
  onSave: (schedule: DaySchedule[]) => void;
  onCancel: () => void;
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeeklySchedule({ schedule, onSave, onCancel }: WeeklyScheduleProps) {
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(
    schedule ||
      WEEKDAYS.map((_, index) => {
        // Default schedule: Mon-Fri 9am-5pm, Sat 9am-12pm, Sun unavailable
        const isWeekday = index < 5;
        const isSaturday = index === 5;
        return {
          isAvailable: isWeekday || isSaturday,
          startHour: isSaturday ? 9 : 9,
          endHour: isSaturday ? 12 : 17,
        };
      })
  );

  const toggleDay = (index: number) => {
    const newSchedule = [...localSchedule];
    newSchedule[index] = {
      ...newSchedule[index],
      isAvailable: !newSchedule[index].isAvailable,
    };
    setLocalSchedule(newSchedule);
  };

  const updateHours = (index: number, field: 'startHour' | 'endHour', hour: number) => {
    const newSchedule = [...localSchedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: hour,
    };
    setLocalSchedule(newSchedule);
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <View className="gap-4">
      {WEEKDAYS.map((day, index) => {
        const daySchedule = localSchedule[index];
        return (
          <View
            key={day}
            className={`p-4 rounded-xl border ${
              daySchedule.isAvailable
                ? 'border-primary-200 bg-primary-50/50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={`font-semibold ${
                  daySchedule.isAvailable ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {day}
              </Text>
              <Switch
                value={daySchedule.isAvailable}
                onValueChange={() => toggleDay(index)}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={daySchedule.isAvailable ? '#22c55e' : '#9ca3af'}
              />
            </View>

            {daySchedule.isAvailable && (
              <View className="flex-row gap-3">
                {/* Start Time */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Start</Text>
                  <View className="flex-row flex-wrap gap-1">
                    {[6, 7, 8, 9, 10, 11, 12].map((hour) => (
                      <TouchableOpacity
                        key={`start-${hour}`}
                        onPress={() => updateHours(index, 'startHour', hour)}
                        className={`px-2 py-1 rounded text-xs ${
                          daySchedule.startHour === hour
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            daySchedule.startHour === hour
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {formatHour(hour)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* End Time */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">End</Text>
                  <View className="flex-row flex-wrap gap-1">
                    {[12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => (
                      <TouchableOpacity
                        key={`end-${hour}`}
                        onPress={() => updateHours(index, 'endHour', hour)}
                        className={`px-2 py-1 rounded text-xs ${
                          daySchedule.endHour === hour
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            daySchedule.endHour === hour
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {formatHour(hour)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {!daySchedule.isAvailable && (
              <Text className="text-sm text-gray-400">Unavailable</Text>
            )}
          </View>
        );
      })}

      {/* Actions */}
      <View className="flex-row gap-3 mt-4">
        <Button variant="outline" onPress={onCancel} className="flex-1 h-12">
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </Button>
        <Button onPress={() => onSave(localSchedule)} className="flex-1 h-12">
          <Text className="text-white font-semibold">Save Schedule</Text>
        </Button>
      </View>
    </View>
  );
}

function Text({ className, children }: { className?: string; children: React.ReactNode }) {
  return <>{children}</>;
}
