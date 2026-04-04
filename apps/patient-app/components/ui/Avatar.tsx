import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-error-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  if (src && !imageError) {
    return (
      <Image
        source={{ uri: src }}
        className={cn('rounded-full', sizeStyles[size], className)}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <View
      className={cn(
        'rounded-full items-center justify-center',
        sizeStyles[size],
        getColorFromName(name),
        className
      )}
    >
      <Text className={cn('font-semibold text-white', textSizeStyles[size])}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
