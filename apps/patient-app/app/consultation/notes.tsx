import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Share, Calendar, User } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/utils';

const mockNotes = {
  id: '1',
  consultationId: '1',
  doctor: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialty: 'Cardiologist',
  },
  date: '2024-03-29',
  type: 'video',
  diagnosis: 'Hypertension - Stage 1',
  notes: 'Patient presents with elevated blood pressure (145/92 mmHg). Started on Amlodipine 5mg once daily. Recommend dietary modifications including reduced sodium intake and regular exercise. Follow-up in 4 weeks to assess response to treatment.',
  prescriptions: [
    {
      id: 'p1',
      medicine: 'Amlodipine 5mg',
      dosage: '5mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take in the morning with food',
    },
  ],
  followUpDate: '2024-04-26',
};

export default function ConsultationNotesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Consultation Notes"
        showBack
        onBack={() => router.back()}
        rightAction={
          <Button
            title=""
            onPress={() => {}}
            variant="ghost"
            className="w-10 h-10 p-0"
          >
            <Share size={20} color="#4F46E5" />
          </Button>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Consultation Summary */}
        <View className="p-4">
          <Card className="mb-4">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                <FileText size={24} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Consultation Summary
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Badge variant="success">Completed</Badge>
                  <Text className="text-xs text-gray-500">
                    {new Date(mockNotes.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <User size={18} color="#6B7280" />
                <View>
                  <Text className="text-xs text-gray-500">Doctor</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    Dr. {mockNotes.doctor.firstName} {mockNotes.doctor.lastName}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {mockNotes.doctor.specialty}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Calendar size={18} color="#6B7280" />
                <View>
                  <Text className="text-xs text-gray-500">Date</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {new Date(mockNotes.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Diagnosis */}
          <Card className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Diagnosis
            </Text>
            <Badge variant="warning" className="self-start mb-3">
              <Text className="font-medium">{mockNotes.diagnosis}</Text>
            </Badge>
          </Card>

          {/* Notes */}
          <Card className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Clinical Notes
            </Text>
            <Text className="text-sm text-gray-600 leading-relaxed">
              {mockNotes.notes}
            </Text>
          </Card>

          {/* Prescriptions */}
          <Card className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Prescriptions
            </Text>
            <View className="gap-3">
              {mockNotes.prescriptions.map((prescription) => (
                <View
                  key={prescription.id}
                  className="p-3 bg-gray-50 rounded-xl"
                >
                  <Text className="text-sm font-semibold text-gray-900">
                    {prescription.medicine}
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    <Badge variant="default">
                      <Text className="text-xs">{prescription.dosage}</Text>
                    </Badge>
                    <Badge variant="primary">
                      <Text className="text-xs">{prescription.frequency}</Text>
                    </Badge>
                    <Badge variant="secondary">
                      <Text className="text-xs">{prescription.duration}</Text>
                    </Badge>
                  </View>
                  <Text className="text-xs text-gray-600 mt-2">
                    {prescription.instructions}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Follow-up */}
          {mockNotes.followUpDate && (
            <Card className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Follow-up Appointment
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Calendar size={18} color="#4F46E5" />
                  <Text className="text-sm text-gray-900">
                    {new Date(mockNotes.followUpDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Button
                  title="Book"
                  variant="outline"
                  size="sm"
                  onPress={() => {}}
                />
              </View>
            </Card>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              title="Download"
              variant="outline"
              onPress={() => {}}
              className="flex-1"
              leftIcon={<Download size={18} color="#4F46E5" />}
            />
            <Button
              title="Share"
              variant="outline"
              onPress={() => {}}
              className="flex-1"
              leftIcon={<Share size={18} color="#4F46E5" />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
