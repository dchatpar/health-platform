import React from 'react';
import { Stack } from 'expo-router';
import { authStore } from '@/store/authStore';

export default function AuthLayout() {
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Redirect to main app if already authenticated
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-license" />
    </Stack>
  );
}
