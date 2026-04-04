import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WeeklySchedule } from '@/components/schedule/WeeklySchedule';

export default function ProfileScreen() {
  const router = useRouter();
  const { doctor, logout, updateProfile, updateSchedule } = useAuth();
  const [isOnline, setIsOnline] = useState(doctor?.isOnline || false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const handleToggleOnline = async (value: boolean) => {
    setIsOnline(value);
    // In production, this would call an API to update the doctor's online status
    await updateProfile({ isOnline: value });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSaveSchedule = async (schedule: any) => {
    await updateSchedule(schedule);
    setIsEditingSchedule(false);
    Alert.alert('Success', 'Schedule updated successfully');
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: '👤',
          label: 'Edit Profile',
          onPress: () => router.push('/(tabs)/profile'),
        },
        {
          icon: '🔐',
          label: 'Change Password',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
        {
          icon: '📱',
          label: 'Notifications',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
      ],
    },
    {
      title: 'Practice',
      items: [
        {
          icon: '📋',
          label: 'Qualifications',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
        {
          icon: '🏥',
          label: 'Clinic Information',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
        {
          icon: '💳',
          label: 'Banking Information',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: '📖',
          label: 'Help Center',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
        {
          icon: '💬',
          label: 'Contact Support',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
        {
          icon: '📜',
          label: 'Terms of Service',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
        {
          icon: '🔒',
          label: 'Privacy Policy',
          onPress: () => Alert.alert('Coming Soon', 'Feature under development'),
        },
      ],
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Card className="p-6 mb-4">
        <View className="items-center mb-4">
          <Avatar
            name={doctor?.name || 'Dr. Unknown'}
            size="xl"
            source={doctor?.avatar}
          />
          <Text className="text-xl font-bold text-gray-900 mt-3">
            {doctor?.name || 'Dr. Unknown'}
          </Text>
          <Text className="text-gray-600 mt-1">
            {doctor?.specialty || 'General Practice'}
          </Text>
          <View className="flex-row gap-2 mt-2">
            <Badge variant={doctor?.isOnline ? 'success' : 'gray'} size="md">
              {doctor?.isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant="primary" size="md">
              License Verified
            </Badge>
          </View>
        </View>

        {/* Online Status Toggle */}
        <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
          <View className="flex-row items-center gap-3">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isOnline ? 'bg-success-100' : 'bg-gray-100'
              }`}
            >
              <Text className="text-lg">{isOnline ? '🟢' : '⚫'}</Text>
            </View>
            <View>
              <Text className="font-medium text-gray-900">Accepting Patients</Text>
              <Text className="text-sm text-gray-500">
                {isOnline ? 'Patients can book appointments' : 'You appear offline'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={isOnline ? '#22c55e' : '#9ca3af'}
          />
        </View>
      </Card>

      {/* Schedule Section */}
      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Weekly Schedule
          </Text>
          <TouchableOpacity
            onPress={() =>
              isEditingSchedule
                ? handleSaveSchedule(doctor?.schedule)
                : setIsEditingSchedule(true)
            }
          >
            <Text className="text-primary-600 font-medium">
              {isEditingSchedule ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingSchedule ? (
          <WeeklySchedule
            schedule={doctor?.schedule}
            onSave={handleSaveSchedule}
            onCancel={() => setIsEditingSchedule(false)}
          />
        ) : (
          <View className="gap-2">
            {WEEKDAYS.map((day, index) => {
              const schedule = doctor?.schedule?.[index];
              const isAvailable = schedule?.isAvailable;
              const startHour = schedule?.startHour;
              const endHour = schedule?.endHour;

              return (
                <View
                  key={day}
                  className="flex-row justify-between items-center py-2"
                >
                  <Text className="text-gray-700 w-24">{day}</Text>
                  {isAvailable ? (
                    <Text className="text-gray-600">
                      {startHour}:00 - {endHour}:00
                    </Text>
                  ) : (
                    <Text className="text-gray-400">Unavailable</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Settings Sections */}
      {profileSections.map((section) => (
        <Card key={section.title} className="p-4 mb-4">
          <Text className="text-sm font-semibold text-gray-500 mb-3">
            {section.title.toUpperCase()}
          </Text>
          {section.items.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center justify-between py-3 ${
                index < section.items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-lg">{item.icon}</Text>
                <Text className="text-gray-900">{item.label}</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          ))}
        </Card>
      ))}

      {/* Logout Button */}
      <Button
        variant="outline"
        onPress={handleLogout}
        className="h-12 border-error-200"
      >
        <Text className="text-error-600 font-semibold">Logout</Text>
      </Button>

      {/* App Version */}
      <Text className="text-center text-gray-400 text-sm mt-6">
        Doctor App v1.0.0
      </Text>
    </ScrollView>
  );
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
