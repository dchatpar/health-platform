import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <View
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
