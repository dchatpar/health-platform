import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useEarnings } from '@/hooks/useEarnings';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function WithdrawScreen() {
  const router = useRouter();
  const { doctor } = useAuth();
  const { weeklyEarnings, canWithdraw, lastWithdrawal, requestWithdrawal, isWithdrawing } =
    useEarnings();

  const netEarnings = weeklyEarnings * 0.8;

  const handleWithdraw = async () => {
    if (!canWithdraw) {
      Alert.alert(
        'Withdrawal Unavailable',
        'You can only withdraw once per week. Please check back later.'
      );
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw $${netEarnings.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: async () => {
            try {
              await requestWithdrawal(netEarnings);
              Alert.alert(
                'Success',
                'Your withdrawal request has been submitted. Funds will be transferred within 2-3 business days.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.message || 'Failed to process withdrawal'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Withdraw Earnings',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerClassName="p-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Available Balance */}
        <Card className="p-6 mb-4 items-center">
          <Text className="text-gray-600 mb-2">Available for Withdrawal</Text>
          <Text className="text-4xl font-bold text-gray-900">
            ${netEarnings.toFixed(2)}
          </Text>
          <View className="flex-row items-center gap-2 mt-3">
            <Badge variant={canWithdraw ? 'success' : 'warning'} size="md">
              {canWithdraw ? 'Ready to Withdraw' : 'Limit Reached'}
            </Badge>
          </View>
        </Card>

        {/* Weekly Summary */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            This Week's Summary
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Gross Earnings</Text>
              <Text className="text-gray-900 font-medium">
                ${weeklyEarnings.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-600">Platform Fee (20%)</Text>
                <Text className="text-xs text-gray-400">?</Text>
              </View>
              <Text className="text-gray-500">
                -${(weeklyEarnings * 0.2).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-900 font-semibold">Net Earnings</Text>
              <Text className="text-gray-900 font-bold">
                ${netEarnings.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Banking Info */}
        <Card className="p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Payout Method
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-600 font-medium text-sm">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
              <Text className="text-xl">🏦</Text>
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">
                {doctor?.bankingInfo?.bankName || 'Bank Account'}
              </Text>
              <Text className="text-sm text-gray-500">
                {doctor?.bankingInfo?.accountNumber
                  ? `****${doctor.bankingInfo.accountNumber.slice(-4)}`
                  : 'No account linked'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Withdrawal Limit Info */}
        <Card className="p-4 mb-4 bg-primary-50 border-primary-200">
          <View className="flex-row items-start gap-3">
            <Text className="text-xl">ℹ️</Text>
            <View className="flex-1">
              <Text className="text-primary-800 font-semibold mb-1">
                Weekly Withdrawal Limit
              </Text>
              <Text className="text-primary-700 text-sm">
                You can request a withdrawal once per week. Unpaid earnings
                will roll over to the next week. Minimum withdrawal amount is
                $50.
              </Text>
            </View>
          </View>
        </Card>

        {/* Last Withdrawal */}
        {lastWithdrawal && (
          <Card className="p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-500 mb-2">
              LAST WITHDRAWAL
            </Text>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-medium">
                  ${lastWithdrawal.amount.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-500">
                  {format(parseISO(lastWithdrawal.date), 'MMM d, yyyy')}
                </Text>
              </View>
              <Badge variant="success" size="sm">
                Completed
              </Badge>
            </View>
          </Card>
        )}

        {/* Timeline */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Withdrawal Timeline
          </Text>
          <View className="gap-4">
            <View className="flex-row gap-3">
              <View className="items-center">
                <View className="w-8 h-8 rounded-full bg-success-100 items-center justify-center">
                  <Text className="text-success-600 text-sm">✓</Text>
                </View>
                <View className="w-0.5 h-8 bg-gray-200" />
              </View>
              <View className="flex-1 pb-4">
                <Text className="font-medium text-gray-900">Request Submitted</Text>
                <Text className="text-sm text-gray-500">Within 24 hours</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="items-center">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-gray-400 text-sm">2</Text>
                </View>
                <View className="w-0.5 h-8 bg-gray-200" />
              </View>
              <View className="flex-1 pb-4">
                <Text className="font-medium text-gray-900">Processing</Text>
                <Text className="text-sm text-gray-500">1-2 business days</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="items-center">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-gray-400 text-sm">3</Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Funds Received</Text>
                <Text className="text-sm text-gray-500">2-3 business days total</Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          onPress={handleWithdraw}
          disabled={!canWithdraw || netEarnings < 50 || isWithdrawing}
          className="h-12"
        >
          <Text className="text-white font-semibold">
            {isWithdrawing
              ? 'Processing...'
              : `Withdraw $${netEarnings.toFixed(2)}`}
          </Text>
        </Button>
        {netEarnings < 50 && netEarnings > 0 && (
          <Text className="text-center text-gray-500 text-sm mt-2">
            Minimum withdrawal amount is $50
          </Text>
        )}
      </View>
    </View>
  );
}
