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
import { Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const { login, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error?.message || 'Invalid email or password. Please try again.'
      );
    }
  };

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
          <View className="mt-12 mb-10">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600">
              Sign in to continue to your health dashboard
            </Text>
          </View>

          {/* Login Type Toggle */}
          <View className="flex-row items-center gap-4 mb-8">
            <TouchableOpacity
              onPress={() => setIsPhoneLogin(false)}
              className={`flex-1 py-2 rounded-lg ${
                !isPhoneLogin ? 'bg-primary-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  !isPhoneLogin ? 'text-white' : 'text-gray-700'
                }`}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsPhoneLogin(true)}
              className={`flex-1 py-2 rounded-lg ${
                isPhoneLogin ? 'bg-primary-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isPhoneLogin ? 'text-white' : 'text-gray-700'
                }`}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {!isPhoneLogin ? (
            <View className="gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
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
                  />
                )}
              />
            </View>
          ) : (
            <View className="gap-4">
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color="#6B7280" />}
              />
              <Input
                label="OTP"
                placeholder="Enter 6-digit OTP"
                keyboardType="number-pad"
                maxLength={6}
                leftIcon={<Lock size={20} color="#6B7280" />}
              />
              <Button title="Request OTP" variant="outline" className="mt-2" />
            </View>
          )}

          <View className="flex-row items-center justify-between mt-4">
            <Checkbox
              checked={false}
              onChange={() => {}}
              label="Remember me"
            />
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text className="text-primary-600 font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="mt-6"
          />

          <View className="flex-row items-center justify-center mt-8 gap-2">
            <Text className="text-gray-600">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-primary-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
