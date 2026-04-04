import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export default function VerifyLicenseScreen() {
  const router = useRouter();
  const { doctor, isLoading } = useAuth();

  // Mock license status - in production this would come from the auth hook
  const licenseStatus = {
    status: 'pending', // 'pending', 'approved', 'rejected', 'expired'
    licenseNumber: 'MD-2024-12345',
    expiryDate: '2027-12-31',
    specialty: doctor?.specialty || 'General Practice',
    verifiedAt: null,
  };

  const getStatusColor = () => {
    switch (licenseStatus.status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'expired':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = () => {
    switch (licenseStatus.status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'License Verification',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8 mt-4">
          <Avatar
            name={doctor?.name || 'Dr. Unknown'}
            size="xl"
            source={doctor?.avatar}
          />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            {doctor?.name || 'Dr. Unknown'}
          </Text>
          <Text className="text-gray-600 mt-1">{licenseStatus.specialty}</Text>
        </View>

        <Card className="p-6 bg-white mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              License Status
            </Text>
            <Badge variant={getStatusColor()} size="md">
              {getStatusText()}
            </Badge>
          </View>

          <View className="gap-3">
            <View className="flex-row justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">License Number</Text>
              <Text className="text-gray-900 font-medium">
                {licenseStatus.licenseNumber}
              </Text>
            </View>

            <View className="flex-row justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Expiry Date</Text>
              <Text className="text-gray-900 font-medium">
                {licenseStatus.expiryDate}
              </Text>
            </View>

            <View className="flex-row justify-between py-3">
              <Text className="text-gray-600">Specialty</Text>
              <Text className="text-gray-900 font-medium">
                {licenseStatus.specialty}
              </Text>
            </View>
          </View>
        </Card>

        {licenseStatus.status === 'pending' && (
          <Card className="p-6 bg-warning-50 border-warning-200 mb-6">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-warning-100 items-center justify-center">
                <Text className="text-warning-600 text-lg">⏳</Text>
              </View>
              <View className="flex-1">
                <Text className="text-warning-800 font-semibold mb-1">
                  Verification Under Review
                </Text>
                <Text className="text-warning-700 text-sm">
                  Your license is being reviewed by our team. This typically
                  takes 1-2 business days. You can still access basic features
                  while waiting.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {licenseStatus.status === 'rejected' && (
          <Card className="p-6 bg-error-50 border-error-200 mb-6">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-error-100 items-center justify-center">
                <Text className="text-error-600 text-lg">✕</Text>
              </View>
              <View className="flex-1">
                <Text className="text-error-800 font-semibold mb-1">
                  Verification Rejected
                </Text>
                <Text className="text-error-700 text-sm">
                  Your license could not be verified. Please contact support
                  for more information or submit a new verification request.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {licenseStatus.status === 'expired' && (
          <Card className="p-6 bg-error-50 border-error-200 mb-6">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-error-100 items-center justify-center">
                <Text className="text-error-600 text-lg">⚠</Text>
              </View>
              <View className="flex-1">
                <Text className="text-error-800 font-semibold mb-1">
                  License Expired
                </Text>
                <Text className="text-error-700 text-sm">
                  Your medical license has expired. Please renew and submit a
                  new verification request to continue using the platform.
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View className="gap-3">
          {(licenseStatus.status === 'pending' ||
            licenseStatus.status === 'rejected') && (
            <Button
              variant="primary"
              className="h-12"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-white font-semibold">Update License</Text>
            </Button>
          )}

          <Button
            variant="outline"
            className="h-12"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 font-semibold">Go Back</Text>
          </Button>
        </View>

        <Text className="text-center text-gray-500 text-sm mt-8">
          Need help? Contact support@healthplatform.com
        </Text>
      </ScrollView>
    </View>
  );
}
