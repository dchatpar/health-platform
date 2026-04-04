import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { format, parseISO, subMonths, isAfter } from 'date-fns';
import { useEarnings } from '@/hooks/useEarnings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type FilterPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'all';

export default function HistoryScreen() {
  const router = useRouter();
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('this_month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { earnings, isLoading, refetch } = useEarnings();

  const filteredEarnings = useMemo(() => {
    let filtered = [...earnings];

    const now = new Date();
    let startDate: Date | null = null;

    switch (filterPeriod) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter((e) => {
          const date = parseISO(e.date);
          return date >= startDate! && date <= endOfLastMonth;
        });
        return filtered.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case 'last_3_months':
        startDate = subMonths(now, 3);
        break;
      case 'all':
        startDate = null;
        break;
    }

    if (startDate) {
      filtered = filtered.filter((e) => isAfter(parseISO(e.date), startDate!));
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [earnings, filterPeriod]);

  const totalAmount = useMemo(() => {
    return filteredEarnings.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredEarnings]);

  const netAmount = totalAmount * 0.8;
  const platformFee = totalAmount * 0.2;

  const handleExport = (format: 'csv' | 'pdf') => {
    setShowExportMenu(false);
    // In production, generate and download the file
    Alert.alert(
      'Export Started',
      `Your ${format.toUpperCase()} file is being generated and will be downloaded shortly.`
    );
  };

  const groupByMonth = (transactions: typeof filteredEarnings) => {
    const grouped: Record<string, typeof transactions> = {};

    transactions.forEach((transaction) => {
      const monthKey = format(parseISO(transaction.date), 'MMMM yyyy');
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(transaction);
    });

    return grouped;
  };

  const groupedTransactions = groupByMonth(filteredEarnings);

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Transaction History',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowExportMenu(!showExportMenu)}>
              <Text className="text-primary-600 font-medium">Export</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Export Menu */}
      {showExportMenu && (
        <Card className="absolute top-16 right-4 z-10 p-2 shadow-lg">
          <TouchableOpacity
            onPress={() => handleExport('csv')}
            className="px-4 py-3 rounded-lg"
          >
            <Text className="text-gray-900">Export as CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleExport('pdf')}
            className="px-4 py-3 rounded-lg"
          >
            <Text className="text-gray-900">Export as PDF</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Period Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-200"
        contentContainerClassName="px-4 py-3 gap-2"
      >
        {[
          { key: 'this_month', label: 'This Month' },
          { key: 'last_month', label: 'Last Month' },
          { key: 'last_3_months', label: 'Last 3 Months' },
          { key: 'all', label: 'All Time' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            onPress={() => setFilterPeriod(period.key as FilterPeriod)}
            className={`px-4 py-2 rounded-full ${
              filterPeriod === period.key ? 'bg-gray-900' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filterPeriod === period.key ? 'text-white' : 'text-gray-700'
              }`}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary */}
      <Card className="m-4 p-4">
        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-sm text-gray-500">Total Earnings</Text>
            <Text className="text-2xl font-bold text-gray-900">
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-gray-500">Your Share (80%)</Text>
            <Text className="text-2xl font-bold text-success-600">
              ${netAmount.toFixed(2)}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between text-sm text-gray-500">
          <Text>Platform Fees (20%)</Text>
          <Text>-${platformFee.toFixed(2)}</Text>
        </View>
      </Card>

      {/* Transactions List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {Object.entries(groupedTransactions).map(([month, transactions]) => (
          <View key={month} className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">
              {month}
            </Text>
            {transactions.map((transaction) => (
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
                          : transaction.type === 'withdrawal'
                          ? 'Withdrawal'
                          : transaction.type}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {format(parseISO(transaction.date), 'MMM d, yyyy • h:mm a')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-success-600 font-semibold">
                      +${(transaction.amount * 0.8).toFixed(2)}
                    </Text>
                    <Badge variant="success" size="sm">
                      Paid
                    </Badge>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ))}

        {filteredEarnings.length === 0 && (
          <Card className="p-8 items-center justify-center">
            <Text className="text-3xl mb-3">📋</Text>
            <Text className="text-gray-600 text-center font-medium">
              No transactions found
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              Transactions will appear here once you start earning
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
