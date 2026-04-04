import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, Video, MapPin, CreditCard } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Calendar } from '@/components/appointments/Calendar';
import { TimeSlotPicker } from '@/components/appointments/TimeSlotPicker';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/utils';
import { TIME_SLOTS } from '@/lib/constants';

const mockDoctor = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  avatar: undefined,
  specialty: { id: '1', name: 'Cardiologist', icon: 'heart' },
  consultationFee: 150,
  clinic: {
    id: 'c1',
    name: 'Heart Care Center',
    address: { street: '123 Medical Drive', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
  },
};

const consultationTypes = [
  { id: 'in-person', label: 'In-Person Visit', icon: MapPin, fee: 0 },
  { id: 'teleconsultation', label: 'Video Consultation', icon: Video, fee: 0 },
];

export default function BookAppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState('teleconsultation');
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [step, setStep] = useState(1);

  const doctor = mockDoctor;

  const handleBook = () => {
    Alert.alert(
      'Confirm Booking',
      `Book ${selectedType === 'teleconsultation' ? 'video consultation' : 'in-person appointment'} with Dr. ${doctor.firstName} ${doctor.lastName} on ${selectedDate} at ${selectedTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Your appointment has been booked!', [
              { text: 'OK', onPress: () => router.replace('/appointments') },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Book Appointment"
        showBack
        onBack={() => router.back()}
      />

      {/* Progress */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-2">
          {[1, 2, 3].map((s) => (
            <View key={s} className="flex-1">
              <View
                className={cn(
                  'h-1 rounded-full',
                  step >= s ? 'bg-primary-600' : 'bg-gray-200'
                )}
              />
            </View>
          ))}
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className={cn('text-xs', step >= 1 ? 'text-primary-600' : 'text-gray-500')}>
            Type
          </Text>
          <Text className={cn('text-xs', step >= 2 ? 'text-primary-600' : 'text-gray-500')}>
            Date & Time
          </Text>
          <Text className={cn('text-xs', step >= 3 ? 'text-primary-600' : 'text-gray-500')}>
            Confirm
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Step 1: Consultation Type */}
        {step === 1 && (
          <View className="p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Select Consultation Type
            </Text>
            <View className="gap-3">
              {consultationTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  className={cn(
                    'p-4 rounded-xl border-2',
                    selectedType === type.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={cn(
                        'w-12 h-12 rounded-full items-center justify-center',
                        selectedType === type.id ? 'bg-primary-600' : 'bg-gray-100'
                      )}
                    >
                      <type.icon
                        size={24}
                        color={selectedType === type.id ? '#FFFFFF' : '#6B7280'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900">
                        {type.label}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {type.id === 'teleconsultation'
                          ? 'Connect via video call'
                          : 'Visit the clinic in person'}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        'w-6 h-6 rounded-full border-2 items-center justify-center',
                        selectedType === type.id
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      )}
                    >
                      {selectedType === type.id && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <View className="p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Select Date & Time
            </Text>

            <Text className="text-base font-medium text-gray-700 mb-3">Date</Text>
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              className="mb-6"
            />

            {selectedDate && (
              <>
                <Text className="text-base font-medium text-gray-700 mb-3">Time</Text>
                <TimeSlotPicker
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  className="mb-6"
                />
              </>
            )}
          </View>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <View className="p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Booking
            </Text>

            <Card className="mb-4">
              <View className="flex-row gap-3 mb-4">
                <Avatar
                  src={doctor.avatar}
                  name={`${doctor.firstName} ${doctor.lastName}`}
                  size="lg"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </Text>
                  <Text className="text-sm text-primary-600">
                    {doctor.specialty.name}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Clock size={18} color="#6B7280" />
                  <View>
                    <Text className="text-sm text-gray-600">Date & Time</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' at '}
                      {selectedTime}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  {selectedType === 'teleconsultation' ? (
                    <Video size={18} color="#6B7280" />
                  ) : (
                    <MapPin size={18} color="#6B7280" />
                  )}
                  <View>
                    <Text className="text-sm text-gray-600">Type</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {selectedType === 'teleconsultation'
                        ? 'Video Consultation'
                        : 'In-Person Visit'}
                    </Text>
                  </View>
                </View>

                {selectedType === 'in-person' && (
                  <View className="flex-row items-center gap-3">
                    <MapPin size={18} color="#6B7280" />
                    <View>
                      <Text className="text-sm text-gray-600">Location</Text>
                      <Text className="text-sm font-medium text-gray-900">
                        {doctor.clinic.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {doctor.clinic.address.street}, {doctor.clinic.address.city}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>

            <Card>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600">Consultation Fee</Text>
                <Text className="font-medium text-gray-900">
                  ${doctor.consultationFee}
                </Text>
              </View>
              {selectedType === 'teleconsultation' && (
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600">Platform Fee</Text>
                  <Text className="font-medium text-gray-900">$0</Text>
                </View>
              )}
              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                <Text className="font-semibold text-gray-900">Total</Text>
                <Text className="font-bold text-primary-600">
                  ${doctor.consultationFee}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <View className="flex-row gap-3">
          {step > 1 && (
            <Button
              title="Back"
              onPress={() => setStep(step - 1)}
              variant="outline"
              className="flex-1"
            />
          )}
          {step < 3 ? (
            <Button
              title="Continue"
              onPress={() => setStep(step + 1)}
              className="flex-1"
              disabled={step === 2 && (!selectedDate || !selectedTime)}
            />
          ) : (
            <Button
              title="Confirm Booking"
              onPress={handleBook}
              className="flex-1"
              leftIcon={<CreditCard size={18} color="#FFFFFF" />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
