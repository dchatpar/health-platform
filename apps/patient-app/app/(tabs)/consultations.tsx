import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, MessageSquare, Clock, Phone } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { EmptyView } from '@/components/common/Empty';
import { cn } from '@/lib/utils';

const consultations = [
  {
    id: '1',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      avatar: undefined,
    },
    status: 'in-progress',
    type: 'video',
    scheduledTime: '10:30 AM',
    roomId: 'room-123',
  },
  {
    id: '2',
    doctor: {
      name: 'Dr. Michael Chen',
      specialty: 'General Physician',
      avatar: undefined,
    },
    status: 'scheduled',
    type: 'video',
    scheduledTime: '2:00 PM',
    roomId: 'room-456',
  },
];

export default function ConsultationsScreen() {
  const router = useRouter();

  const activeConsultations = consultations.filter(
    (c) => c.status === 'in-progress' || c.status === 'waiting'
  );
  const upcomingConsultations = consultations.filter(
    (c) => c.status === 'scheduled'
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header title="Teleconsultations" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Active Consultation */}
        {activeConsultations.length > 0 && (
          <View className="px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Active Consultation
            </Text>
            {activeConsultations.map((consultation) => (
              <Card key={consultation.id} className="mb-3">
                <View className="flex-row gap-3 mb-3">
                  <Avatar
                    src={consultation.doctor.avatar}
                    name={consultation.doctor.name}
                    size="md"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {consultation.doctor.name}
                    </Text>
                    <Text className="text-sm text-primary-600">
                      {consultation.doctor.specialty}
                    </Text>
                  </View>
                  <Badge variant="warning" className="flex-row items-center gap-1">
                    <View className="w-2 h-2 rounded-full bg-warning-600 animate-pulse" />
                    <Text>Live</Text>
                  </Badge>
                </View>

                <View className="flex-row gap-2">
                  <Button
                    title="Join Video"
                    onPress={() => router.push(`/consultation/${consultation.id}`)}
                    className="flex-1"
                    leftIcon={<Video size={18} color="#FFFFFF" />}
                  />
                  <Button
                    title="Chat"
                    onPress={() => router.push(`/consultation/${consultation.id}`)}
                    variant="outline"
                    className="flex-1"
                    leftIcon={<MessageSquare size={18} color="#4F46E5" />}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Upcoming Consultations */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Upcoming Consultations
          </Text>
          {upcomingConsultations.length > 0 ? (
            upcomingConsultations.map((consultation) => (
              <Card key={consultation.id} className="mb-3">
                <View className="flex-row gap-3 mb-3">
                  <Avatar
                    src={consultation.doctor.avatar}
                    name={consultation.doctor.name}
                    size="md"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {consultation.doctor.name}
                    </Text>
                    <Text className="text-sm text-primary-600">
                      {consultation.doctor.specialty}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Clock size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-600">
                        Today at {consultation.scheduledTime}
                      </Text>
                    </View>
                  </View>
                  <Badge variant="primary">
                    <View className="flex-row items-center gap-1">
                      <Video size={12} />
                      <Text>Video</Text>
                    </View>
                  </Badge>
                </View>

                <Button
                  title="Join When Ready"
                  variant="outline"
                  onPress={() => router.push(`/consultation/${consultation.id}`)}
                  className="w-full"
                />
              </Card>
            ))
          ) : (
            <Card>
              <View className="items-center py-6">
                <Video size={40} color="#D1D5DB" />
                <Text className="text-gray-600 mt-3 mb-4">
                  No upcoming consultations
                </Text>
                <Button
                  title="Find a Doctor"
                  onPress={() => router.push('/search')}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Quick Help */}
        <View className="px-4 py-4 pb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Need Help?
          </Text>
          <Card>
            <View className="flex-row gap-4">
              <TouchableOpacity className="flex-1 items-center p-4">
                <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mb-2">
                  <Phone size={24} color="#4F46E5" />
                </View>
                <Text className="text-sm font-medium text-gray-900">
                  Call Support
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center p-4">
                <View className="w-12 h-12 rounded-full bg-success-100 items-center justify-center mb-2">
                  <MessageSquare size={24} color="#10B981" />
                </View>
                <Text className="text-sm font-medium text-gray-900">
                  Chat Support
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
