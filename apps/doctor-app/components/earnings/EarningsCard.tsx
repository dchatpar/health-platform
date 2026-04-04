import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EarningsCardProps {
  totalEarnings: number;
  netEarnings: number;
  platformFee: number;
  appointmentCount: number;
  isCurrentWeek: boolean;
}

export function EarningsCard({
  totalEarnings,
  netEarnings,
  platformFee,
  appointmentCount,
  isCurrentWeek,
}: EarningsCardProps) {
  return (
    <Card className="p-6 mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-sm text-gray-500 mb-1">
            {isCurrentWeek ? "This Week's" : 'Total'} Earnings
          </Text>
          <Text className="text-3xl font-bold text-gray-900">
            ${netEarnings.toFixed(2)}
          </Text>
        </View>
        <Badge variant="success" size="lg">
          80/20 Split
        </Badge>
      </View>

      <View className="flex-row justify-between py-3 border-t border-gray-100">
        <View>
          <Text className="text-sm text-gray-500">Gross Earnings</Text>
          <Text className="text-lg font-semibold text-gray-900">
            ${totalEarnings.toFixed(2)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-gray-500">Your Share (80%)</Text>
          <Text className="text-lg font-semibold text-success-600">
            ${netEarnings.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between py-3 border-t border-gray-100">
        <View>
          <Text className="text-sm text-gray-500">Platform Fee (20%)</Text>
          <Text className="text-lg font-semibold text-gray-400">
            -${platformFee.toFixed(2)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-gray-500">Appointments</Text>
          <Text className="text-lg font-semibold text-gray-900">
            {appointmentCount}
          </Text>
        </View>
      </View>
    </Card>
  );
}
