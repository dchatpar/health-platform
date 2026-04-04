import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const withdrawalSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) >= 50, {
    message: 'Minimum withdrawal is $50',
  }),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
  availableAmount: number;
  onSubmit: (amount: number) => Promise<void>;
  isLoading: boolean;
}

export function WithdrawalForm({
  availableAmount,
  onSubmit,
  isLoading,
}: WithdrawalFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WithdrawalFormData>({
    defaultValues: {
      amount: availableAmount.toString(),
    },
  });

  const watchAmount = watch('amount');
  const parsedAmount = parseFloat(watchAmount) || 0;

  const onFormSubmit = async (data: WithdrawalFormData) => {
    try {
      await onSubmit(parseFloat(data.amount));
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to process withdrawal');
    }
  };

  return (
    <View className="gap-4">
      {/* Available Amount */}
      <Card className="p-4">
        <Text className="text-sm text-gray-500 mb-1">Available Balance</Text>
        <Text className="text-3xl font-bold text-gray-900">
          ${availableAmount.toFixed(2)}
        </Text>
      </Card>

      {/* Amount Input */}
      <Card className="p-4">
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Text className="text-gray-500 text-lg mr-1">$</Text>
                <Input
                  placeholder="0.00"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  className="flex-1 border-0 p-0"
                  style={{ borderWidth: 0 }}
                />
              </View>
              {errors.amount && (
                <Text className="text-error-500 text-sm mt-1">
                  {errors.amount.message}
                </Text>
              )}

              {/* Quick Amount Buttons */}
              <View className="flex-row gap-2 mt-3">
                {[50, 100, 200, availableAmount].map((amount) => (
                  <Button
                    key={amount}
                    variant={parsedAmount === amount ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => onChange(amount.toString())}
                    disabled={amount > availableAmount}
                    className="flex-1"
                  >
                    <Text
                      className={`${
                        parsedAmount === amount
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      ${amount}
                    </Text>
                  </Button>
                ))}
              </View>
            </View>
          )}
        />
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-gray-50">
        <View className="flex-row items-start gap-3">
          <Text className="text-lg">ℹ️</Text>
          <View className="flex-1">
            <Text className="text-gray-900 font-medium mb-1">
              Weekly Limit
            </Text>
            <Text className="text-gray-600 text-sm">
              You can withdraw once per week. Funds will be transferred within
              2-3 business days to your linked bank account.
            </Text>
          </View>
        </View>
      </Card>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onFormSubmit)}
        disabled={isLoading || parsedAmount < 50 || parsedAmount > availableAmount}
        className="h-12"
      >
        <Text className="text-white font-semibold">
          {isLoading ? 'Processing...' : `Withdraw $${parsedAmount.toFixed(2)}`}
        </Text>
      </Button>
    </View>
  );
}
