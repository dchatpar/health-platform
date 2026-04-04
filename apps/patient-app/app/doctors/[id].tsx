import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  Calendar,
  ChevronLeft,
  Language,
  Award,
  MessageSquare,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/utils';

const mockDoctor = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah@example.com',
  phone: '+1234567890',
  avatar: undefined,
  specialty: { id: '1', name: 'Cardiologist', icon: 'heart' },
  qualifications: [
    { id: 'q1', degree: 'MD - Cardiology', institution: 'Harvard Medical School', year: 2010 },
    { id: 'q2', degree: 'Fellowship - Interventional Cardiology', institution: 'Mayo Clinic', year: 2013 },
  ],
  yearsOfExperience: 15,
  bio: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology, heart failure management, and interventional procedures.',
  rating: 4.8,
  reviewCount: 124,
  consultationFee: 150,
  availableForTeleconsultation: true,
  availableForHomeVisit: false,
  languages: ['English', 'Spanish'],
  clinic: {
    id: 'c1',
    name: 'Heart Care Center',
    address: { street: '123 Medical Drive', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    phone: '+1234567890',
    coordinates: { latitude: 40.7128, longitude: -74.006 },
  },
  workingHours: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true },
  ],
};

const reviews = [
  {
    id: '1',
    patientName: 'John D.',
    rating: 5,
    comment: 'Excellent doctor! Very thorough and takes time to explain everything.',
    date: '2024-03-15',
  },
  {
    id: '2',
    patientName: 'Mary S.',
    rating: 4,
    comment: 'Great experience. The consultation was very helpful.',
    date: '2024-03-10',
  },
];

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const doctor = mockDoctor;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Doctor Profile"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Doctor Info */}
        <View className="px-4 py-4 bg-white">
          <View className="flex-row gap-4 mb-4">
            <Avatar
              src={doctor.avatar}
              name={`${doctor.firstName} ${doctor.lastName}`}
              size="xl"
            />
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </Text>
              <Text className="text-primary-600 font-medium">
                {doctor.specialty.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-sm font-medium text-gray-900">
                  {doctor.rating}
                </Text>
                <Text className="text-sm text-gray-500">
                  ({doctor.reviewCount} reviews)
                </Text>
              </View>
              <Text className="text-sm text-gray-600 mt-1">
                {doctor.yearsOfExperience} years experience
              </Text>
            </View>
          </View>

          {/* Quick Info Badges */}
          <View className="flex-row flex-wrap gap-2">
            {doctor.availableForTeleconsultation && (
              <Badge variant="success">
                <View className="flex-row items-center gap-1">
                  <Video size={12} />
                  <Text>Video Consult</Text>
                </View>
              </Badge>
            )}
            <Badge variant="primary">
              <View className="flex-row items-center gap-1">
                <Award size={12} />
                <Text>Board Certified</Text>
              </View>
            </Badge>
            <Badge variant="default">
              <Text>${doctor.consultationFee}/visit</Text>
            </Badge>
          </View>
        </View>

        {/* About */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">About</Text>
          <Card>
            <Text className="text-gray-600 leading-relaxed">{doctor.bio}</Text>
          </Card>
        </View>

        {/* Qualifications */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Qualifications
          </Text>
          <Card>
            <View className="gap-3">
              {doctor.qualifications.map((qual, index) => (
                <View
                  key={qual.id}
                  className={cn(
                    index !== doctor.qualifications.length - 1 && 'pb-3 border-b border-gray-100'
                  )}
                >
                  <Text className="text-sm font-medium text-gray-900">
                    {qual.degree}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {qual.institution} • {qual.year}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Languages */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Languages
          </Text>
          <Card>
            <View className="flex-row flex-wrap gap-2">
              {doctor.languages.map((lang) => (
                <Badge key={lang} variant="default">
                  <View className="flex-row items-center gap-1">
                    <Language size={12} />
                    <Text>{lang}</Text>
                  </View>
                </Badge>
              ))}
            </View>
          </Card>
        </View>

        {/* Clinic Info */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Clinic Information
          </Text>
          <Card>
            <View className="flex-row gap-3">
              <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center">
                <MapPin size={24} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {doctor.clinic.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {doctor.clinic.address.street}
                </Text>
                <Text className="text-sm text-gray-600">
                  {doctor.clinic.address.city}, {doctor.clinic.address.state}{' '}
                  {doctor.clinic.address.zipCode}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Working Hours */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Working Hours
          </Text>
          <Card>
            <View className="gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const hours = doctor.workingHours.find((w) => w.dayOfWeek === index + 1);
                return (
                  <View key={day} className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">{day}</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {hours?.isAvailable
                        ? `${hours.startTime} - ${hours.endTime}`
                        : 'Closed'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Reviews */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Reviews ({doctor.reviewCount})
            </Text>
            <Button title="See All" variant="ghost" size="sm" onPress={() => {}} />
          </View>
          <Card>
            <View className="gap-4">
              {reviews.map((review) => (
                <View
                  key={review.id}
                  className={cn(
                    'pb-4 border-b border-gray-100',
                    review.id === reviews[reviews.length - 1].id && 'pb-0 border-b-0'
                  )}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-900">
                      {review.patientName}
                    </Text>
                    <View className="flex-row">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color="#F59E0B"
                          fill={i < review.rating ? '#F59E0B' : 'none'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text className="text-sm text-gray-600">{review.comment}</Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Bottom Action */}
        <View className="px-4 py-6 pb-8 bg-white border-t border-gray-100">
          <View className="flex-row gap-3">
            <Button
              title="Message"
              variant="outline"
              onPress={() => {}}
              className="flex-1"
              leftIcon={<MessageSquare size={18} color="#4F46E5" />}
            />
            <Button
              title="Book Appointment"
              onPress={() => router.push(`/doctors/book/${id}`)}
              className="flex-2"
              leftIcon={<Calendar size={18} color="#FFFFFF" />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
