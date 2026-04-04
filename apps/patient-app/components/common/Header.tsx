import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className,
  transparent = false,
}: HeaderProps) {
  const content = (
    <View
      className={cn(
        'flex-row items-center justify-between px-4 py-3',
        transparent ? 'bg-transparent' : 'bg-white',
        Platform.OS === 'ios' && 'pb-0',
        className
      )}
    >
      <View className="flex-row items-center flex-1">
        {showBack && onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="mr-3 w-10 h-10 items-center justify-center -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-xl font-semibold text-gray-900" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      {rightAction && <View className="ml-4">{rightAction}</View>}
    </View>
  );

  if (transparent) {
    return content;
  }

  return (
    <SafeAreaView edges={Platform.OS === 'android' ? ['top'] : ['top']} className="bg-white">
      {content}
    </SafeAreaView>
  );
}

interface NotificationButtonProps {
  onPress: () => void;
  count?: number;
}

export function NotificationButton({ onPress, count }: NotificationButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-10 h-10 items-center justify-center"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Bell size={24} color="#374151" />
      {count !== undefined && count > 0 && (
        <View className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error-500 items-center justify-center">
          <Text className="text-xs text-white font-medium">
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
