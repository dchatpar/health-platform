import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={cn(
          'bg-white rounded-2xl shadow-sm border border-gray-100',
          'p-4',
          className
        )}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        'p-4',
        className
      )}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between mb-3', className)}>
      <View>
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {action}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <View className={cn('', className)}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <View className={cn('flex-row items-center gap-3 mt-4 pt-4 border-t border-gray-100', className)}>
      {children}
    </View>
  );
}
