import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn('flex-row items-center gap-3', className)}
      activeOpacity={0.7}
    >
      <View
        className={cn(
          'w-12 h-7 rounded-full p-1',
          checked ? 'bg-primary-600' : 'bg-gray-300',
          disabled && 'opacity-50'
        )}
      >
        <View
          className={cn(
            'w-5 h-5 rounded-full bg-white shadow-sm',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </View>
      {label && (
        <Text className={cn('text-base text-gray-700', disabled && 'opacity-50')}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
