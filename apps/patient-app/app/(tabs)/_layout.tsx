import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, Search, Calendar, Pill, FileText, Wallet, User } from 'lucide-react-native';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'index', label: 'Home', icon: Home },
  { name: 'search', label: 'Search', icon: Search },
  { name: 'appointments', label: 'Appointments', icon: Calendar },
  { name: 'consultations', label: 'Consult', icon: Calendar },
  { name: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { name: 'records', label: 'Records', icon: FileText },
  { name: 'wallet', label: 'Wallet', icon: Wallet },
  { name: 'profile', label: 'Profile', icon: User },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          tabBarLabel: 'Consult',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pharmacy"
        options={{
          tabBarLabel: 'Pharmacy',
          tabBarIcon: ({ color, size }) => <Pill size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          tabBarLabel: 'Records',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
