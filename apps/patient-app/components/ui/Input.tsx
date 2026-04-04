import React, { forwardRef } from 'react';
import { TextInput, Text, View, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <View className={cn('w-full', containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </Text>
        )}
        <View
          className={cn(
            'flex-row items-center border rounded-xl bg-white',
            'px-4 py-3 min-h-[48px]',
            error
              ? 'border-error-500'
              : isFocused
              ? 'border-primary-500 border-2'
              : 'border-gray-200',
            className
          )}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={cn(
              'flex-1 text-gray-900 text-base',
              'placeholder:text-gray-400',
              'min-h-[44px]'
            )}
            placeholderTextColor="#9CA3AF"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-sm text-error-500 mt-1">{error}</Text>
        )}
        {hint && !error && (
          <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
