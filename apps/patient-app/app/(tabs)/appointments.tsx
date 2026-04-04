import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Video, MapPin, Plus } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { EmptyView } from '@/components/common/Empty';
import { cn } from '@/lib/utils';

const appointments = [
  {
    id: '1',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      avatar: undefined,
    },
    date: '2024-04-05',
    time: '10:30 AM',
    type: 'teleconsultation',
    status: 'confirmed',
    reason: 'Follow-up consultation for heart health',
  },
  {
    id: '2',
    doctor: {
      name: 'Dr. Michael Chen',
      specialty: 'General Physician',
      avatar: undefined,
    },
    date: '2024-04-06',
    time: '2:00 PM',
    type: 'in-person',
    status: 'scheduled',
    reason: 'Annual health checkup',
  },
  {
    id: '3',
    doctor: {
      name: 'Dr. Emily Brown',
      specialty: 'Dermatologist',
      avatar: undefined,
    },
    date: '2024-03-28',
    time: '11:00 AM',
    type: 'teleconsultation',
    status: 'completed',
    reason: 'Skin condition consultation',
  },
];

type FilterType = 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('upcoming');

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'upcoming') {
      return ['scheduled', 'confirmed', 'in-progress'].includes(apt.status);
    }
    if (filter === 'completed') {
      return apt.status === 'completed';
    }
    if (filter === 'cancelled') {
      return apt.status === 'cancelled';
    }
    return true;
  });

  const typeIconMap: Record<string, React.ReactNode> = {
    teleconsultation: <Video size={14} color="#4F46E5" />,
    'in-person': <MapPin size={14} color="#6B7280" />,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Appointments"
        rightAction={
          <Button
            title=""
            onPress={() => router.push('/search')}
            variant="ghost"
            className="w-10 h-10 p-0"
          >
            <Plus size={24} color="#4F46E5" />
          </Button>
        }
      />

      {/* Filter Tabs */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row gap-2">
          {(['upcoming', 'completed', 'cancelled'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-full',
                filter === f ? 'bg-primary-600' : 'bg-gray-100'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium capitalize',
                  filter === f ? 'text-white' : 'text-gray-700'
                )}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <FlashList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          estimatedItemSize={160}
          renderItem={({ item }) => (
            <Card
              onPress={() => router.push(`/doctors/${item.id}`)}
              className="m-4"
            >
              <View className="flex-row gap-3 mb-3">
                <Avatar
                  src={item.doctor.avatar}
                  name={item.doctor.name}
                  size="md"
                />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-gray-900">
                      {item.doctor.name}
                    </Text>
                    <StatusBadge
                      status={item.status}
                      variant={
                        item.status === 'completed'
                          ? 'success'
                          : item.status === 'cancelled'
                          ? 'error'
                          : 'primary'
                      }
                    />
                  </View>
                  <Text className="text-sm text-primary-600">
                    {item.doctor.specialty}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4 mb-2">
                <View className="flex-row items-center gap-1.5">
                  <Calendar size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Clock size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600">{item.time}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mb-2">
                {typeIconMap[item.type]}
                <Text className="text-sm text-gray-600 capitalize">
                  {item.type.replace('-', ' ')}
                </Text>
              </View>

              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {item.reason}
              </Text>

              {item.status === 'completed' && (
                <View className="mt-3 pt-3 border-t border-gray-100">
                  <Button
                    title="Book Again"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push(`/doctors/${item.id}`)}
                  />
                </View>
              )}
            </Card>
          )}
          contentContainerClassName="py-4"
        />
      ) : (
        <EmptyView
          title={`No ${filter} appointments`}
          description={
            filter === 'upcoming'
              ? 'Book an appointment with a doctor'
              : `You don't have any ${filter} appointments`
          }
          actionLabel={filter === 'upcoming' ? 'Find Doctors' : undefined}
          onAction={filter === 'upcoming' ? () => router.push('/search') : undefined}
        />
      )}
    </SafeAreaView>
  );
}
