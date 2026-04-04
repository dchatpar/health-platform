import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorView({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorViewProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-6', className)}>
      <View className="w-16 h-16 rounded-full bg-error-100 items-center justify-center mb-4">
        <AlertCircle size={32} color="#EF4444" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2">{title}</Text>
      <Text className="text-base text-gray-600 text-center mb-6">{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          leftIcon={<RefreshCw size={18} color="#FFFFFF" />}
        />
      )}
    </View>
  );
}

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <View className="flex-1 bg-white">
      <ErrorView title={title} message={message} onRetry={onRetry} />
    </View>
  );
}
