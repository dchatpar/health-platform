import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, ChevronLeft, Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { OrderTracker } from '@/components/pharmacy/OrderTracker';
import { cn } from '@/lib/utils';

const mockOrder = {
  id: '1',
  pharmacyName: 'HealthPlus Pharmacy',
  pharmacyPhone: '+1234567890',
  pharmacyAddress: '123 Main Street, New York, NY 10001',
  items: [
    { id: '1', name: 'Paracetamol 500mg', quantity: 2, price: 5.99 },
    { id: '2', name: 'Ibuprofen 400mg', quantity: 1, price: 7.99 },
  ],
  subtotal: 19.97,
  deliveryFee: 3.99,
  total: 23.96,
  status: 'preparing' as const,
  deliveryAddress: {
    street: '456 Oak Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10002',
  },
  estimatedDelivery: '2024-03-29 2:30 PM',
  createdAt: '2024-03-29 1:45 PM',
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const order = mockOrder;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Order Tracking"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Tracker */}
        <View className="p-4">
          <OrderTracker status={order.status} />
        </View>

        {/* Estimated Delivery */}
        <View className="px-4 pb-4">
          <Card>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                <Clock size={20} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">Estimated Delivery</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {order.estimatedDelivery}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Delivery Address */}
        <View className="px-4 pb-4">
          <Card>
            <Text className="text-sm font-medium text-gray-500 mb-2">
              Delivery Address
            </Text>
            <View className="flex-row items-start gap-3">
              <MapPin size={20} color="#6B7280" />
              <View className="flex-1">
                <Text className="text-base text-gray-900">
                  {order.deliveryAddress.street}
                </Text>
                <Text className="text-sm text-gray-600">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                  {order.deliveryAddress.zipCode}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Pharmacy Info */}
        <View className="px-4 pb-4">
          <Card>
            <Text className="text-sm font-medium text-gray-500 mb-2">
              From Pharmacy
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center">
                  <Text className="text-lg">💊</Text>
                </View>
                <Text className="text-base font-medium text-gray-900">
                  {order.pharmacyName}
                </Text>
              </View>
              <Button
                title=""
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0"
              >
                <Phone size={20} color="#4F46E5" />
              </Button>
            </View>
          </Card>
        </View>

        {/* Order Items */}
        <View className="px-4 pb-4">
          <Card>
            <Text className="text-sm font-medium text-gray-500 mb-3">
              Order Items
            </Text>
            <View className="gap-3">
              {order.items.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-base text-gray-900">{item.name}</Text>
                    <Text className="text-sm text-gray-500">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-base font-medium text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Subtotal</Text>
                <Text className="text-sm text-gray-900">
                  ${order.subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Delivery Fee</Text>
                <Text className="text-sm text-gray-900">
                  ${order.deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                <Text className="font-semibold text-gray-900">Total</Text>
                <Text className="font-bold text-primary-600">
                  ${order.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View className="px-4 pb-8">
          <Button
            title="Contact Pharmacy"
            variant="outline"
            onPress={() => {}}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
