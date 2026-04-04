import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

interface PayoutRowProps {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'withdrawal' | 'earning';
}

export function PayoutRow({
  amount,
  date,
  status,
  type,
}: PayoutRowProps) {
  const formattedDate = format(parseISO(date), 'MMM d, yyyy');

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>;
    }
  };

  return (
    <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
      <View className="flex-row items-center gap-3">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            type === 'earning' ? 'bg-success-100' : 'bg-primary-100'
          }`}
        >
          <Text>{type === 'earning' ? '+' : '↓'}</Text>
        </View>
        <View>
          <Text className="font-medium text-gray-900 capitalize">
            {type}
          </Text>
          <Text className="text-sm text-gray-500">{formattedDate}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text
          className={`font-semibold ${
            type === 'earning' ? 'text-success-600' : 'text-gray-900'
          }`}
        >
          {type === 'earning' ? '+' : '-'}${amount.toFixed(2)}
        </Text>
        {getStatusBadge()}
      </View>
    </View>
  );
}
