import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { MapPin, Clock, Star, Truck, Search } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/common/Header';
import { EmptyView } from '@/components/common/Empty';
import { cn } from '@/lib/utils';

const pharmacies = [
  {
    id: '1',
    name: 'HealthPlus Pharmacy',
    rating: 4.8,
    reviewCount: 124,
    address: '123 Main St, New York, NY',
    is24Hours: true,
    deliveryAvailable: true,
    deliveryTime: '30-45 min',
  },
  {
    id: '2',
    name: 'MedCare Dispensary',
    rating: 4.6,
    reviewCount: 89,
    address: '456 Oak Ave, Los Angeles, CA',
    is24Hours: false,
    deliveryAvailable: true,
    deliveryTime: '45-60 min',
  },
  {
    id: '3',
    name: 'QuickMeds',
    rating: 4.7,
    reviewCount: 203,
    address: '789 Pine Rd, Chicago, IL',
    is24Hours: true,
    deliveryAvailable: true,
    deliveryTime: '20-30 min',
  },
];

const recentOrders = [
  {
    id: '1',
    pharmacyName: 'HealthPlus Pharmacy',
    items: 3,
    total: 45.99,
    status: 'delivered',
    date: '2024-03-28',
  },
  {
    id: '2',
    pharmacyName: 'MedCare Dispensary',
    items: 1,
    total: 12.99,
    status: 'preparing',
    date: '2024-03-29',
  },
];

export default function PharmacyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header title="Pharmacy" />

      {/* Search */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Input
          placeholder="Search pharmacies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color="#6B7280" />}
          containerClassName="mb-0"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Recent Orders
              </Text>
              <TouchableOpacity>
                <Text className="text-sm text-primary-600 font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order) => (
              <Card
                key={order.id}
                onPress={() => router.push(`/pharmacy/order/${order.id}`)}
                className="mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-gray-900">
                    {order.pharmacyName}
                  </Text>
                  <Badge
                    variant={
                      order.status === 'delivered'
                        ? 'success'
                        : order.status === 'preparing'
                        ? 'warning'
                        : 'primary'
                    }
                  >
                    {order.status}
                  </Badge>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">
                    {order.items} item{order.items !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {new Date(order.date).toLocaleDateString()}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Nearby Pharmacies */}
        <View className="px-4 py-4 pb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Nearby Pharmacies
          </Text>
          {pharmacies.map((pharmacy) => (
            <Card
              key={pharmacy.id}
              onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
              className="mb-3"
            >
              <View className="flex-row gap-3 mb-3">
                <View className="w-16 h-16 rounded-xl bg-primary-100 items-center justify-center">
                  <Text className="text-2xl">💊</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {pharmacy.name}
                  </Text>
                  <View className="flex-row items-center gap-1 mb-1">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text className="text-sm font-medium text-gray-900">
                      {pharmacy.rating}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      ({pharmacy.reviewCount})
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color="#6B7280" />
                    <Text className="text-sm text-gray-600" numberOfLines={1}>
                      {pharmacy.address}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-4 pt-3 border-t border-gray-100">
                <View className="flex-row items-center gap-1">
                  <Clock size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600">
                    {pharmacy.is24Hours ? '24/7' : pharmacy.deliveryTime}
                  </Text>
                </View>
                {pharmacy.deliveryAvailable && (
                  <Badge variant="success" size="sm">
                    <View className="flex-row items-center gap-1">
                      <Truck size={10} />
                      <Text>Delivery</Text>
                    </View>
                  </Badge>
                )}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
