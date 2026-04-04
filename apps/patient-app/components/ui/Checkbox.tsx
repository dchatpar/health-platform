import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn('flex-row items-center gap-3', className)}
      activeOpacity={0.7}
    >
      <View
        className={cn(
          'w-6 h-6 rounded-md border-2 items-center justify-center',
          checked
            ? 'bg-primary-600 border-primary-600'
            : 'bg-white border-gray-300',
          disabled && 'opacity-50'
        )}
      >
        {checked && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
      </View>
      {label && (
        <Text className={cn('text-base text-gray-700', disabled && 'opacity-50')}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
