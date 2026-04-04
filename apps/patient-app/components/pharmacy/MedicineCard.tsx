import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Star, Truck } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils';
import type { Pharmacy } from '@/lib/types';

interface MedicineCardProps {
  pharmacy: Pharmacy;
  onPress: () => void;
  className?: string;
}

export function MedicineCard({ pharmacy, onPress, className }: MedicineCardProps) {
  return (
    <Card onPress={onPress} className={cn('', className)}>
      <View className="flex-row gap-3">
        <View className="w-16 h-16 rounded-xl bg-primary-100 items-center justify-center">
          <Text className="text-2xl">💊</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {pharmacy.name}
          </Text>
          <View className="flex-row items-center gap-1 mb-1">
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-sm font-medium text-gray-900">
              {pharmacy.rating.toFixed(1)}
            </Text>
            <Text className="text-sm text-gray-500">
              ({pharmacy.reviewCount} reviews)
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#6B7280" />
            <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
              {pharmacy.address.street}, {pharmacy.address.city}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center gap-4">
        <View className="flex-row items-center gap-1">
          <Clock size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600">
            {pharmacy.is24Hours ? '24/7' : pharmacy.openingHours}
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
  );
}
