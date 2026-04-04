import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-secondary-600 active:bg-secondary-700',
  outline: 'border-2 border-primary-600 bg-transparent active:bg-primary-50',
  ghost: 'bg-transparent active:bg-primary-50',
  danger: 'bg-error-600 active:bg-error-700',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary-600',
  ghost: 'text-primary-600',
  danger: 'text-white',
};

const sizeStyles = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50',
        className
      )}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#4F46E5' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text
            className={cn(
              'font-semibold',
              textSizeStyles[size],
              variantTextStyles[variant]
            )}
          >
            {title}
          </Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}
