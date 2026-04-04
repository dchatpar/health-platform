import React from 'react';
import { TextInput, Text, View } from 'react-native';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  containerClassName,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View className={cn('w-full', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      <View
        className={cn(
          'border rounded-xl bg-white',
          'px-4 py-3',
          error
            ? 'border-error-500'
            : isFocused
            ? 'border-primary-500 border-2'
            : 'border-gray-200'
        )}
      >
        <TextInput
          className={cn(
            'text-gray-900 text-base min-h-[100px]',
            'placeholder:text-gray-400',
            className
          )}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text className="text-sm text-error-500 mt-1">{error}</Text>}
      {hint && !error && (
        <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
      )}
    </View>
  );
}
