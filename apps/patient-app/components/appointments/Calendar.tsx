import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selectedDate: string | undefined;
  onSelectDate: (date: string) => void;
  availableDates?: string[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = new Date(),
  maxDate,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isDateAvailable = (day: number): boolean => {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    if (availableDates.length > 0) {
      return availableDates.includes(dateString);
    }
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isBeyondMax = maxDate && date > maxDate;
    return !isPast && !isBeyondMax;
  };

  const isDateSelected = (day: number): boolean => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const isToday = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const renderDays = () => {
    const days: React.ReactNode[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const available = isDateAvailable(day);
      const selected = isDateSelected(day);
      const today = isToday(day);

      days.push(
        <TouchableOpacity
          key={day}
          onPress={() => available && onSelectDate(new Date(year, month, day).toISOString().split('T')[0])}
          disabled={!available}
          className={cn(
            'w-10 h-10 rounded-full items-center justify-center',
            selected && 'bg-primary-600',
            today && !selected && 'border-2 border-primary-600',
            !available && 'opacity-30'
          )}
        >
          <Text
            className={cn(
              'text-sm font-medium',
              selected ? 'text-white' : available ? 'text-gray-900' : 'text-gray-400'
            )}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View className={cn('bg-white rounded-2xl p-4', className)}>
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={prevMonth} className="w-10 h-10 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} className="w-10 h-10 items-center justify-center">
          <ChevronRight size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-2">
        {DAYS.map((day) => (
          <View key={day} className="w-10 h-8 items-center justify-center">
            <Text className="text-xs font-medium text-gray-500">{day}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">{renderDays()}</View>
    </View>
  );
}
