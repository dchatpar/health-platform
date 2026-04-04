import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  Phone,
  User,
  Calendar,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const { register, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: undefined,
      insuranceId: '',
      insuranceProvider: '',
    },
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const onSubmit = async (data: RegisterInput) => {
    try {
      await register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender!,
        insuranceId: data.insuranceId,
        insuranceProvider: data.insuranceProvider,
      });
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.message || 'Failed to create account. Please try again.'
      );
    }
  };

  const renderStep1 = () => (
    <View className="gap-4">
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="First Name"
            placeholder="Enter your first name"
            leftIcon={<User size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.firstName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            leftIcon={<User size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.lastName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
          />
        )}
      />
    </View>
  );

  const renderStep2 = () => (
    <View className="gap-4">
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            leftIcon={<Calendar size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.dateOfBirth?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Gender"
            placeholder="Select your gender"
            options={genderOptions}
            value={value}
            onChange={onChange}
            error={errors.gender?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="insuranceId"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Insurance ID (Optional)"
            placeholder="Enter your insurance ID"
            leftIcon={<Shield size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.insuranceId?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="insuranceProvider"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Insurance Provider (Optional)"
            placeholder="Enter your insurance provider"
            leftIcon={<Shield size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.insuranceProvider?.message}
          />
        )}
      />
    </View>
  );

  const renderStep3 = () => (
    <View className="gap-4">
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={<Lock size={20} color="#6B7280" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            }
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            hint="Must be at least 8 characters"
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={<Lock size={20} color="#6B7280" />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      <Checkbox
        checked={false}
        onChange={() => {}}
        label="I agree to the Terms of Service and Privacy Policy"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-8 mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-base text-gray-600">
              Fill in your details to get started
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  step >= s ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>

          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Step {step} of 3
            {step === 1 && ' - Personal Info'}
            {step === 2 && ' - Additional Details'}
            {step === 3 && ' - Security'}
          </Text>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <View className="flex-row gap-3 mt-6">
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
              />
            ) : (
              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                className="flex-1"
              />
            )}
          </View>

          <View className="flex-row items-center justify-center mt-8 gap-2">
            <Text className="text-gray-600">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text className="text-primary-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
