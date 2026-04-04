import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    id: '1',
    label: 'Edit Profile',
    icon: User,
    onPress: () => {},
  },
  {
    id: '2',
    label: 'Notifications',
    icon: Bell,
    onPress: () => {},
  },
  {
    id: '3',
    label: 'Payment Methods',
    icon: CreditCard,
    onPress: () => {},
  },
  {
    id: '4',
    label: 'Privacy & Security',
    icon: Shield,
    onPress: () => {},
  },
  {
    id: '5',
    label: 'Help & Support',
    icon: HelpCircle,
    onPress: () => {},
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header title="Profile" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-4 py-6 bg-white">
          <View className="flex-row items-center gap-4">
            <Avatar
              src={user?.avatar}
              name={user ? `${user.firstName} ${user.lastName}` : 'John Doe'}
              size="xl"
            />
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : 'John Doe'}
              </Text>
              <Text className="text-sm text-gray-600">
                {user?.email || 'john.doe@example.com'}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-sm font-medium text-gray-900">4.8</Text>
                <Text className="text-sm text-gray-500"> (24 reviews)</Text>
              </View>
            </View>
            <Button
              title="Edit"
              variant="outline"
              size="sm"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Personal Information */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Personal Information
          </Text>
          <Card>
            <View className="gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Mail size={18} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Email</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {user?.email || 'john.doe@example.com'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Phone size={18} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Phone</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {user?.phone || '+1 (555) 123-4567'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Calendar size={18} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Date of Birth</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {user?.dateOfBirth || 'January 15, 1990'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Settings</Text>
          <Card>
            <View className="gap-2">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={item.onPress}
                  className={cn(
                    'flex-row items-center gap-3 py-3',
                    index !== menuItems.length - 1 && 'border-b border-gray-100'
                  )}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                    <item.icon size={18} color="#6B7280" />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-gray-900">
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Notifications Toggle */}
          <Card className="mt-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Bell size={18} color="#6B7280" />
                </View>
                <Text className="text-sm font-medium text-gray-900">
                  Push Notifications
                </Text>
              </View>
              <Switch
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />
            </View>
          </Card>
        </View>

        {/* Logout */}
        <View className="px-4 py-4 pb-8">
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            leftIcon={<LogOut size={18} color="#FFFFFF" />}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
