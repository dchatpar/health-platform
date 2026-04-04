import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const prescriptionSchema = z.object({
  medications: z
    .array(
      z.object({
        name: z.string().min(1, 'Required'),
        dosage: z.string().min(1, 'Required'),
        frequency: z.string().min(1, 'Required'),
        duration: z.string().min(1, 'Required'),
        instructions: z.string().optional(),
      })
    )
    .min(1, 'At least one medication required'),
  notes: z.string().optional(),
  followUp: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  patientAllergies?: string;
  onSubmit: (data: PrescriptionFormData) => void;
  initialData?: Partial<PrescriptionFormData>;
}

export function PrescriptionForm({
  patientAllergies,
  onSubmit,
  initialData,
}: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: initialData?.medications || [
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
      notes: initialData?.notes || '',
      followUp: initialData?.followUp || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
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
    '30 days',
    'Ongoing',
  ];

  const onFormSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerClassName="p-4 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {/* Allergies Warning */}
      {patientAllergies && (
        <Card className="p-4 mb-4 bg-warning-50 border-warning-200">
          <View className="flex-row items-start gap-3">
            <Text className="text-xl">⚠️</Text>
            <View className="flex-1">
              <Text className="text-warning-800 font-semibold">
                Known Allergies
              </Text>
              <Text className="text-warning-700 text-sm mt-1">
                {patientAllergies}
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
            onClick={() =>
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
              <Controller
                control={control}
                name={`medications.${index}.name`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Medication Name"
                    placeholder="e.g., Amoxicillin"
                    value={value}
                    onChangeText={onChange}
                    error={errors.medications?.[index]?.name?.message}
                  />
                )}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name={`medications.${index}.dosage`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Dosage"
                        placeholder="e.g., 500mg"
                        value={value}
                        onChangeText={onChange}
                        error={errors.medications?.[index]?.dosage?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <Controller
                control={control}
                name={`medications.${index}.frequency`}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {frequencyOptions.map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            onPress={() => onChange(opt)}
                            className={`px-3 py-2 rounded-full border ${
                              value === opt
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <Text
                              className={`text-sm ${
                                value === opt
                                  ? 'text-primary-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              />

              <Controller
                control={control}
                name={`medications.${index}.duration`}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </Text>
                    <View className="flex-row gap-2">
                      {durationOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => onChange(opt)}
                          className={`px-3 py-2 rounded-full border ${
                            value === opt
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              value === opt
                                ? 'text-primary-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name={`medications.${index}.instructions`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Special Instructions"
                    placeholder="e.g., Take with food"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onFormSubmit)}
        disabled={isSubmitting}
        className="h-12"
      >
        <Text className="text-white font-semibold">
          {isSubmitting ? 'Sending...' : 'Send Prescription'}
        </Text>
      </Button>
    </ScrollView>
  );
}

function Text({ className, children }: { className?: string; children: React.ReactNode }) {
  return <>{children}</>;
}
