import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, Star, Truck, Phone, ChevronLeft } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/utils';

const mockPharmacy = {
  id: '1',
  name: 'HealthPlus Pharmacy',
  rating: 4.8,
  reviewCount: 124,
  phone: '+1234567890',
  email: 'contact@healthplus.com',
  address: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  },
  is24Hours: true,
  deliveryAvailable: true,
  deliveryRadius: 10,
  deliveryTime: '30-45 min',
  openingHours: '24/7',
};

const popularMedicines = [
  { id: '1', name: 'Paracetamol 500mg', price: 5.99, requiresPrescription: false },
  { id: '2', name: 'Ibuprofen 400mg', price: 7.99, requiresPrescription: false },
  { id: '3', name: 'Amoxicillin 250mg', price: 12.99, requiresPrescription: true },
  { id: '4', name: 'Omeprazole 20mg', price: 15.99, requiresPrescription: true },
  { id: '5', name: 'Cetirizine 10mg', price: 6.99, requiresPrescription: false },
  { id: '6', name: 'Vitamin D3 1000IU', price: 9.99, requiresPrescription: false },
];

export default function PharmacyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const pharmacy = mockPharmacy;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Pharmacy"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pharmacy Info */}
        <View className="p-4 bg-white">
          <View className="flex-row gap-4 mb-4">
            <View className="w-20 h-20 rounded-2xl bg-primary-100 items-center justify-center">
              <Text className="text-4xl">💊</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {pharmacy.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-sm font-medium text-gray-900">
                  {pharmacy.rating}
                </Text>
                <Text className="text-sm text-gray-500">
                  ({pharmacy.reviewCount} reviews)
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600">
                  {pharmacy.address.city}, {pharmacy.address.state}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Badges */}
          <View className="flex-row flex-wrap gap-2">
            {pharmacy.is24Hours && (
              <Badge variant="success">
                <View className="flex-row items-center gap-1">
                  <Clock size={12} />
                  <Text>24/7 Open</Text>
                </View>
              </Badge>
            )}
            {pharmacy.deliveryAvailable && (
              <Badge variant="primary">
                <View className="flex-row items-center gap-1">
                  <Truck size={12} />
                  <Text>Delivery Available</Text>
                </View>
              </Badge>
            )}
          </View>
        </View>

        {/* Delivery Info */}
        {pharmacy.deliveryAvailable && (
          <View className="px-4 py-4">
            <Card>
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                  <Truck size={24} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Delivery Information
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {pharmacy.deliveryTime} • Within {pharmacy.deliveryRadius} miles
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Contact */}
        <View className="px-4 py-4">
          <Card>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                <Phone size={24} color="#4F46E5" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Phone</Text>
                <Text className="text-base font-medium text-gray-900">
                  {pharmacy.phone}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Popular Medicines */}
        <View className="px-4 py-4 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Popular Medicines
            </Text>
          </View>
          <View className="gap-3">
            {popularMedicines.map((medicine) => (
              <Card key={medicine.id}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-medium text-gray-900">
                        {medicine.name}
                      </Text>
                      {medicine.requiresPrescription && (
                        <Badge variant="warning" size="sm">
                          Rx
                        </Badge>
                      )}
                    </View>
                    <Text className="text-sm text-primary-600 font-semibold mt-1">
                      ${medicine.price.toFixed(2)}
                    </Text>
                  </View>
                  <Button
                    title="Add"
                    variant="outline"
                    size="sm"
                    onPress={() => {}}
                  />
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <Button
          title="View All Medicines"
          onPress={() => {}}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}
