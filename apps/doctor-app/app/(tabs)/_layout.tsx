import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center">
      <Text className={`text-xl ${focused ? 'text-primary-600' : 'text-gray-400'}`}>
        {icon}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { doctor } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: '#111827',
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerTitle: `Dr. ${doctor?.name?.split(' ').pop() || 'Doctor'}`,
          tabBarLabel: 'Today',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📅" label="Today" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          headerTitle: 'Appointments',
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Appointments" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          headerTitle: 'Earnings',
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💰" label="Earnings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
