import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppointments } from '@/hooks/useAppointments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const orderSchema = z.object({
  type: z.enum(['lab', 'radiology', 'both']),
  labTests: z.array(z.string()).optional(),
  radiologyTests: z.array(z.string()).optional(),
  urgency: z.enum(['routine', 'urgent', 'stat']),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function OrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById } = useAppointments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointment = getAppointmentById(id);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      type: 'lab',
      urgency: 'routine',
      labTests: [],
      radiologyTests: [],
      notes: '',
    },
  });

  const orderType = watch('type');

  const labTestOptions = [
    'Complete Blood Count (CBC)',
    'Basic Metabolic Panel',
    'Comprehensive Metabolic Panel',
    'Lipid Panel',
    'HbA1c',
    'Thyroid Panel (TSH, T3, T4)',
    'Liver Function Tests',
    'Kidney Function Tests',
    'Urinalysis',
    'Pregnancy Test',
    'STI Screening',
    'COVID-19 Test',
    'Flu Test',
    'Mononucleosis Test',
    'Tuberculosis Test',
  ];

  const radiologyTestOptions = [
    'X-Ray (Chest)',
    'X-Ray (Abdomen)',
    'X-Ray (Bone/Joint)',
    'CT Scan (Head)',
    'CT Scan (Chest)',
    'CT Scan (Abdomen)',
    'MRI (Brain)',
    'MRI (Spine)',
    'MRI (Joint)',
    'Ultrasound (Abdominal)',
    'Ultrasound (Pelvic)',
    'Ultrasound (Thyroid)',
    'EKG',
    'Echocardiogram',
    'Mammogram',
  ];

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      // In production, send to backend
      console.log('Order data:', data);

      Alert.alert(
        'Success',
        'Order has been sent to the laboratory/imaging center and patient has been notified.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTest = (
    test: string,
    field: 'labTests' | 'radiologyTests',
    selectedTests: string[]
  ) => {
    if (selectedTests.includes(test)) {
      return selectedTests.filter((t) => t !== test);
    } else {
      return [...selectedTests, test];
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Order Tests',
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
                {appointment?.patient?.age} years old
              </Text>
            </View>
          </View>
        </Card>

        {/* Order Type */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Order Type
          </Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => onChange('lab')}
                  className={`flex-1 p-4 rounded-xl border ${
                    value === 'lab'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className="text-center text-2xl mb-2">🧪</Text>
                  <Text
                    className={`text-center font-medium ${
                      value === 'lab' ? 'text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Lab Tests
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChange('radiology')}
                  className={`flex-1 p-4 rounded-xl border ${
                    value === 'radiology'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className="text-center text-2xl mb-2">📷</Text>
                  <Text
                    className={`text-center font-medium ${
                      value === 'radiology'
                        ? 'text-primary-700'
                        : 'text-gray-700'
                    }`}
                  >
                    Radiology
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChange('both')}
                  className={`flex-1 p-4 rounded-xl border ${
                    value === 'both'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className="text-center text-2xl mb-2">🔬</Text>
                  <Text
                    className={`text-center font-medium ${
                      value === 'both' ? 'text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </Card>

        {/* Urgency */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Urgency
          </Text>
          <Controller
            control={control}
            name="urgency"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                {[
                  { key: 'routine', label: 'Routine', color: 'gray' },
                  { key: 'urgent', label: 'Urgent', color: 'warning' },
                  { key: 'stat', label: 'STAT', color: 'error' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => onChange(option.key)}
                    className={`flex-1 p-3 rounded-lg border ${
                      value === option.key
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        value === option.key
                          ? `text-${option.color}-700`
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </Card>

        {/* Lab Tests */}
        {(orderType === 'lab' || orderType === 'both') && (
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Laboratory Tests
            </Text>
            <Controller
              control={control}
              name="labTests"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {labTestOptions.map((test) => {
                    const isSelected = value?.includes(test);
                    return (
                      <TouchableOpacity
                        key={test}
                        onPress={() => onChange(toggleTest(test, 'labTests', value || []))}
                        className={`px-3 py-2 rounded-full border ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? 'text-primary-700' : 'text-gray-700'
                          }`}
                        >
                          {test}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
          </Card>
        )}

        {/* Radiology Tests */}
        {(orderType === 'radiology' || orderType === 'both') && (
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Radiology Tests
            </Text>
            <Controller
              control={control}
              name="radiologyTests"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {radiologyTestOptions.map((test) => {
                    const isSelected = value?.includes(test);
                    return (
                      <TouchableOpacity
                        key={test}
                        onPress={() =>
                          onChange(toggleTest(test, 'radiologyTests', value || []))
                        }
                        className={`px-3 py-2 rounded-full border ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? 'text-primary-700' : 'text-gray-700'
                          }`}
                        >
                          {test}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
          </Card>
        )}

        {/* Clinical Notes */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Clinical Notes
          </Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Add any relevant clinical information..."
                value={value}
                onChangeText={onChange}
                multiline
              />
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
            {isSubmitting ? 'Sending...' : 'Send Order'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
