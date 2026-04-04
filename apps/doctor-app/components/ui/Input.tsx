import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  rightIcon,
  leftIcon,
  className = '',
  style,
  ...props
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center border rounded-lg px-3 py-3 bg-white ${
          error ? 'border-error-500' : 'border-gray-300'
        } ${props.editable === false ? 'bg-gray-50' : ''}`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-gray-900 text-base"
          placeholderTextColor="#9ca3af"
          style={style}
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-error-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
