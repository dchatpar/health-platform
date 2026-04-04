import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ChevronRight,
  Bell,
  Wallet,
  FileText,
  Pill,
  Plus,
} from 'lucide-react-native';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header, NotificationButton } from '@/components/common/Header';
import { cn } from '@/lib/utils';

const upcomingAppointments = [
  {
    id: '1',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      avatar: undefined,
    },
    date: 'Today',
    time: '10:30 AM',
    type: 'teleconsultation',
    status: 'confirmed',
  },
  {
    id: '2',
    doctor: {
      name: 'Dr. Michael Chen',
      specialty: 'General Physician',
      avatar: undefined,
    },
    date: 'Tomorrow',
    time: '2:00 PM',
    type: 'in-person',
    status: 'scheduled',
  },
];

const quickActions = [
  { id: '1', label: 'Book Appointment', icon: Calendar, color: '#4F46E5' },
  { id: '2', label: 'Teleconsultation', icon: Video, color: '#10B981' },
  { id: '3', label: 'Order Medicine', icon: Pill, color: '#F59E0B' },
  { id: '4', label: 'Medical Records', icon: FileText, color: '#8B5CF6' },
  { id: '5', label: 'Wallet', icon: Wallet, color: '#EC4899' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Health Patient"
        subtitle="Welcome back, John"
        rightAction={<NotificationButton onPress={() => {}} count={3} />}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Quick Actions
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => {
                  if (action.label === 'Book Appointment') {
                    router.push('/search');
                  }
                }}
                className="items-center"
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon size={24} color={action.color} />
                </View>
                <Text className="text-xs text-gray-700 mt-1.5 font-medium text-center w-16">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Appointments */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Upcoming Appointments
            </Text>
            <TouchableOpacity onPress={() => router.push('/appointments')}>
              <Text className="text-sm text-primary-600 font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="mb-3">
                <View className="flex-row gap-3">
                  <Avatar
                    src={appointment.doctor.avatar}
                    name={appointment.doctor.name}
                    size="md"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {appointment.doctor.name}
                    </Text>
                    <Text className="text-sm text-primary-600">
                      {appointment.doctor.specialty}
                    </Text>
                    <View className="flex-row items-center gap-4 mt-2">
                      <View className="flex-row items-center gap-1">
                        <Calendar size={14} color="#6B7280" />
                        <Text className="text-sm text-gray-600">
                          {appointment.date}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Clock size={14} color="#6B7280" />
                        <Text className="text-sm text-gray-600">
                          {appointment.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Badge
                    variant={
                      appointment.status === 'confirmed' ? 'success' : 'primary'
                    }
                    size="sm"
                  >
                    {appointment.type === 'teleconsultation' ? (
                      <View className="flex-row items-center gap-1">
                        <Video size={10} />
                        <Text>Video</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center gap-1">
                        <MapPin size={10} />
                        <Text>In-Person</Text>
                      </View>
                    )}
                  </Badge>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <View className="items-center py-6">
                <Calendar size={40} color="#D1D5DB" />
                <Text className="text-gray-600 mt-3 mb-4">
                  No upcoming appointments
                </Text>
                <Button
                  title="Book Appointment"
                  onPress={() => router.push('/search')}
                  leftIcon={<Plus size={18} color="#FFFFFF" />}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Health Tips */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Health Tips
          </Text>
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Text className="text-2xl">💡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold mb-1">
                  Stay Hydrated
                </Text>
                <Text className="text-white/80 text-sm">
                  Drink at least 8 glasses of water today for better health
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Recent Activity */}
        <View className="px-4 py-4 pb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Recent Activity
          </Text>
          <Card>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-success-100 items-center justify-center">
                  <Pill size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    Order Delivered
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Your pharmacy order was delivered
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">2h ago</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                  <FileText size={20} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    Lab Results Ready
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Your blood test results are available
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">1d ago</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
