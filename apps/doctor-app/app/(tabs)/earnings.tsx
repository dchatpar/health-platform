import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  isSameWeek,
  parseISO,
} from 'date-fns';
import { useEarnings } from '@/hooks/useEarnings';
import { EarningsCard } from '@/components/earnings/EarningsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EarningsScreen() {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { earnings, isLoading, refetch, canWithdraw, lastWithdrawal, weeklyEarnings } =
    useEarnings();

  const weekRange = useMemo(() => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return { start, end };
  }, [selectedWeek]);

  const currentWeekEarnings = useMemo(() => {
    return earnings.filter((e) => {
      const date = parseISO(e.date);
      return date >= weekRange.start && date <= weekRange.end;
    });
  }, [earnings, weekRange]);

  const totalEarnings = useMemo(() => {
    return currentWeekEarnings.reduce((sum, e) => sum + e.amount, 0);
  }, [currentWeekEarnings]);

  const platformFee = totalEarnings * 0.2; // 20% platform fee
  const netEarnings = totalEarnings * 0.8; // 80% doctor share

  const previousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  const nextWeek = () => {
    setSelectedWeek(addWeeks(selectedWeek, 1));
  };

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 1 });

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-8"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* Week Selector */}
      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={previousWeek}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-gray-600 text-xl">‹</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-lg font-semibold text-gray-900">
              {format(weekRange.start, 'MMM d')} - {format(weekRange.end, 'MMM d, yyyy')}
            </Text>
            {isCurrentWeek && (
              <Text className="text-sm text-primary-600 mt-1">This Week</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={nextWeek}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            disabled={isCurrentWeek}
          >
            <Text
              className={`text-xl ${
                isCurrentWeek ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Earnings Summary */}
      <EarningsCard
        totalEarnings={totalEarnings}
        netEarnings={netEarnings}
        platformFee={platformFee}
        appointmentCount={currentWeekEarnings.length}
        isCurrentWeek={isCurrentWeek}
      />

      {/* Withdraw Button */}
      <View className="mt-4 mb-6">
        <Button
          onPress={() => router.push('/earnings/withdraw')}
          disabled={!canWithdraw || netEarnings === 0}
          className="h-12"
        >
          <Text className="text-white font-semibold">
            {canWithdraw ? 'Withdraw Earnings' : 'Withdrawal Unavailable'}
          </Text>
        </Button>
        {!canWithdraw && (
          <Text className="text-center text-gray-500 text-sm mt-2">
            {lastWithdrawal
              ? `Last withdrawal: ${format(parseISO(lastWithdrawal.date), 'MMM d, yyyy')}`
              : 'Weekly withdrawal available soon'}
          </Text>
        )}
      </View>

      {/* Recent Transactions */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </Text>
          <TouchableOpacity onPress={() => router.push('/earnings/history')}>
            <Text className="text-primary-600 font-medium text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        {currentWeekEarnings.length === 0 ? (
          <Card className="p-6 items-center justify-center">
            <Text className="text-3xl mb-2">💰</Text>
            <Text className="text-gray-600 text-center">
              No transactions this week
            </Text>
          </Card>
        ) : (
          currentWeekEarnings.slice(0, 5).map((transaction) => (
            <Card key={transaction.id} className="p-4 mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-success-100 items-center justify-center">
                    <Text className="text-success-600">+</Text>
                  </View>
                  <View>
                    <Text className="font-medium text-gray-900">
                      {transaction.type === 'consultation'
                        ? 'Consultation'
                        : transaction.type}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {format(parseISO(transaction.date), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                </View>
                <Text className="text-success-600 font-semibold">
                  +${transaction.amount.toFixed(2)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Fee Structure Info */}
      <Card className="p-4 bg-gray-50">
        <Text className="font-semibold text-gray-900 mb-2">Fee Structure</Text>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Your Earnings</Text>
            <Text className="text-gray-900 font-medium">80%</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Platform Fee</Text>
            <Text className="text-gray-500 text-sm">20%</Text>
          </View>
        </View>
        <Text className="text-gray-500 text-xs mt-3">
          Fees support platform maintenance, payment processing, and customer
          support services.
        </Text>
      </Card>
    </ScrollView>
  );
}
