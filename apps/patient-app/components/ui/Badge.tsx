import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
};

const sizeStyles = {
  sm: 'px-2 py-0.5',
  md: 'px-2.5 py-1',
};

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <View className={cn('rounded-full', variantStyles[variant], sizeStyles[size], className)}>
      <Text
        className={cn(
          'font-medium',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {children}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const formattedStatus = status.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Badge variant={variant} className={className}>
      {formattedStatus}
    </Badge>
  );
}
