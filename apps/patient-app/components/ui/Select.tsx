import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className={cn('w-full', className)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={cn(
          'flex-row items-center justify-between border rounded-xl bg-white',
          'px-4 py-3 min-h-[48px]',
          error ? 'border-error-500' : 'border-gray-200'
        )}
        activeOpacity={0.7}
      >
        <Text className={cn('text-base', selectedOption ? 'text-gray-900' : 'text-gray-400')}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>
      {error && <Text className="text-sm text-error-500 mt-1">{error}</Text>}

      <Modal visible={isOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <SafeAreaView className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">{label || 'Select'}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex-row items-center justify-between px-4 py-4',
                    'border-b border-gray-100'
                  )}
                >
                  <Text className="text-base text-gray-900">{item.label}</Text>
                  {item.value === value && (
                    <Check size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="p-4">
                  <Text className="text-gray-500 text-center">No options available</Text>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
