import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface EmptyViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyView({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyViewProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-6', className)}>
      {icon && (
        <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
          {icon}
        </View>
      )}
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-gray-600 text-center mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </View>
  );
}

interface EmptyScreenProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyScreen(props: EmptyScreenProps) {
  return (
    <View className="flex-1 bg-white">
      <EmptyView {...props} />
    </View>
  );
}
