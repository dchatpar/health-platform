import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function Loading({ size = 'large', fullScreen = false, text, className }: LoadingProps) {
  const content = (
    <View className={cn('items-center justify-center gap-3', className)}>
      <ActivityIndicator size={size} color="#4F46E5" />
      {text && <Text className="text-gray-600 text-base">{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return content;
}

interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text = 'Loading...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text className="text-gray-600 text-base mt-4">{text}</Text>
    </View>
  );
}
