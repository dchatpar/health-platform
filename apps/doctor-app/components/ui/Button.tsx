import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  style,
}: ButtonProps) {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? '#9ca3af' : '#0ea5e9',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? '#9ca3af' : '#a855f7',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? '#9ca3af' : '#d1d5db',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    if (disabled) return '#ffffff';
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#ffffff';
      case 'outline':
      case 'ghost':
        return '#374151';
      default:
        return '#ffffff';
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: 12,
        };
      case 'md':
        return {
          height: 44,
          paddingHorizontal: 16,
        };
      case 'lg':
        return {
          height: 52,
          paddingHorizontal: 24,
        };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl justify-center items-center ${className}`}
      style={[getVariantStyles(), getSizeStyles(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        children || (
          <Text style={{ color: getTextColor(), fontWeight: '600' }}>Button</Text>
        )
      )}
    </TouchableOpacity>
  );
}
