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
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailSent(true);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-20 h-20 rounded-full bg-success-100 items-center justify-center mb-6">
            <Mail size={40} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Check Your Email
          </Text>
          <Text className="text-base text-gray-600 text-center mb-8">
            We've sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/login')}
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 mb-4"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>

          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password
            </Text>
            <Text className="text-base text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password
            </Text>
          </View>

          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="Enter your registered email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Mail size={20} color="#6B7280" />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />
          </View>

          <Button
            title="Send Reset Link"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="mt-6"
          />

          <View className="flex-row items-center justify-center mt-8 gap-2">
            <Text className="text-gray-600">Remember your password?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text className="text-primary-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
