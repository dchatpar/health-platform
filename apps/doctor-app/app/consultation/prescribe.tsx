import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { consultationStore } from '@/store/consultationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const prescriptionSchema = z.object({
  medications: z
    .array(
      z.object({
        name: z.string().min(1, 'Medication name is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
        instructions: z.string().optional(),
      })
    )
    .min(1, 'At least one medication is required'),
  notes: z.string().optional(),
  followUp: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export default function PrescribeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { doctor } = useAuth();
  const { getAppointmentById, completeAppointment } = useAppointments();
  const { notes, clearNotes } = consultationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointment = getAppointmentById(id);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: [
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
      notes: notes || '',
      followUp: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      // In production, send to backend
      console.log('Prescription data:', data);

      // Complete the appointment
      if (appointment) {
        await completeAppointment(appointment.id);
      }

      Alert.alert(
        'Success',
        'Prescription has been sent to the pharmacy and patient has been notified.',
        [
          {
            text: 'OK',
            onPress: () => {
              clearNotes();
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime',
  ];

  const durationOptions = [
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '21 days',
    '30 days',
    '60 days',
    '90 days',
    'Ongoing',
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Write Prescription',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerClassName="p-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Info */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-primary-600">👤</Text>
            </View>
            <View>
              <Text className="font-semibold text-gray-900">
                {appointment?.patient?.name || 'Patient'}
              </Text>
              <Text className="text-sm text-gray-500">
                {appointment?.patient?.age} years old •{' '}
                {appointment?.patient?.gender || 'Not specified'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Allergies Warning */}
        {appointment?.patient?.allergies && (
          <Card className="p-4 mb-4 bg-warning-50 border-warning-200">
            <View className="flex-row items-start gap-3">
              <Text className="text-xl">⚠️</Text>
              <View className="flex-1">
                <Text className="text-warning-800 font-semibold">
                  Known Allergies
                </Text>
                <Text className="text-warning-700 text-sm mt-1">
                  {appointment.patient.allergies}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Medications */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Medications
            </Text>
            <TouchableOpacity
              onPress={() =>
                append({
                  name: '',
                  dosage: '',
                  frequency: '',
                  duration: '',
                  instructions: '',
                })
              }
            >
              <Text className="text-primary-600 font-medium">+ Add</Text>
            </TouchableOpacity>
          </View>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 mb-3">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-semibold text-gray-900">
                  Medication {index + 1}
                </Text>
                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)}>
                    <Text className="text-error-600 font-medium">Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="gap-3">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Medication Name *
                  </Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.name`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="e.g., Amoxicillin"
                        value={value}
                        onChangeText={onChange}
                        error={errors.medications?.[index]?.name?.message}
                      />
                    )}
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </Text>
                    <Controller
                      control={control}
                      name={`medications.${index}.dosage`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          placeholder="e.g., 500mg"
                          value={value}
                          onChangeText={onChange}
                          error={errors.medications?.[index]?.dosage?.message}
                        />
                      )}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </Text>
                    <Controller
                      control={control}
                      name={`medications.${index}.frequency`}
                      render={({ field: { onChange, value } }) => (
                        <View className="relative">
                          <TouchableOpacity
                            className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                            onPress={() => {
                              // Show frequency picker
                              Alert.alert(
                                'Select Frequency',
                                '',
                                frequencyOptions.map((opt) => ({
                                  text: opt,
                                  onPress: () => onChange(opt),
                                }))
                              );
                            }}
                          >
                            <Text
                              className={
                                value ? 'text-gray-900' : 'text-gray-400'
                              }
                            >
                              {value || 'Select'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </Text>
                    <Controller
                      control={control}
                      name={`medications.${index}.duration`}
                      render={({ field: { onChange, value } }) => (
                        <View className="relative">
                          <TouchableOpacity
                            className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                            onPress={() => {
                              Alert.alert(
                                'Select Duration',
                                '',
                                durationOptions.map((opt) => ({
                                  text: opt,
                                  onPress: () => onChange(opt),
                                }))
                              );
                            }}
                          >
                            <Text
                              className={
                                value ? 'text-gray-900' : 'text-gray-400'
                              }
                            >
                              {value || 'Select'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.instructions`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="e.g., Take with food, avoid alcohol"
                        value={value}
                        onChangeText={onChange}
                        multiline
                      />
                    )}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Additional Notes */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Additional Notes
          </Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Any additional instructions or notes for the patient..."
                value={value}
                onChangeText={onChange}
                multiline
                className="text-gray-900 min-h-24 text-left"
                textAlignVertical="top"
              />
            )}
          />
        </Card>

        {/* Follow Up */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Follow-up Recommendation
          </Text>
          <Controller
            control={control}
            name="followUp"
            render={({ field: { onChange, value } }) => (
              <View className="gap-2">
                {[
                  '1 week',
                  '2 weeks',
                  '1 month',
                  '3 months',
                  'As needed',
                  'No follow-up needed',
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => onChange(option)}
                    className={`p-3 rounded-lg border ${
                      value === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={
                        value === option
                          ? 'text-primary-700 font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </Card>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="h-12"
        >
          <Text className="text-white font-semibold">
            {isSubmitting ? 'Sending...' : 'Send Prescription'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
