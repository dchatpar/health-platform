import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  source?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, source, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getSizeStyles = (): { container: string; text: string } => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-8 h-8',
          text: 'text-xs',
        };
      case 'md':
        return {
          container: 'w-10 h-10',
          text: 'text-sm',
        };
      case 'lg':
        return {
          container: 'w-12 h-12',
          text: 'text-base',
        };
      case 'xl':
        return {
          container: 'w-20 h-20',
          text: 'text-xl',
        };
      default:
        return {
          container: 'w-10 h-10',
          text: 'text-sm',
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const initials = name ? getInitials(name) : '?';

  if (source) {
    return (
      <View
        className={`rounded-full overflow-hidden bg-gray-100 ${sizeStyles.container} ${className}`}
      >
        <Image source={{ uri: source }} className="w-full h-full" />
      </View>
    );
  }

  return (
    <View
      className={`rounded-full bg-primary-100 items-center justify-center ${sizeStyles.container} ${className}`}
    >
      <Text className={`font-semibold text-primary-600 ${sizeStyles.text}`}>
        {initials}
      </Text>
    </View>
  );
}
