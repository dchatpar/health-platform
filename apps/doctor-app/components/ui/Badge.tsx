import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary-100',
          text: 'text-primary-700',
        };
      case 'secondary':
        return {
          container: 'bg-secondary-100',
          text: 'text-secondary-700',
        };
      case 'success':
        return {
          container: 'bg-success-100',
          text: 'text-success-700',
        };
      case 'warning':
        return {
          container: 'bg-warning-100',
          text: 'text-warning-700',
        };
      case 'error':
        return {
          container: 'bg-error-100',
          text: 'text-error-700',
        };
      case 'gray':
        return {
          container: 'bg-gray-100',
          text: 'text-gray-700',
        };
      default:
        return {
          container: 'bg-gray-100',
          text: 'text-gray-700',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-0.5',
          text: 'text-xs',
        };
      case 'md':
        return {
          container: 'px-2.5 py-1',
          text: 'text-xs',
        };
      case 'lg':
        return {
          container: 'px-3 py-1.5',
          text: 'text-sm',
        };
      default:
        return {
          container: 'px-2.5 py-1',
          text: 'text-xs',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View className={`rounded-full ${variantStyles.container} ${sizeStyles.container} ${className}`}>
      <Text className={`font-medium ${variantStyles.text} ${sizeStyles.text}`}>
        {children}
      </Text>
    </View>
  );
}
