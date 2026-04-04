import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/utils';

const balance = 1250.50;

const transactions = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    description: 'Added Funds',
    date: '2024-03-29',
    balanceAfter: 1250.50,
  },
  {
    id: '2',
    type: 'debit',
    amount: -150,
    description: 'Consultation with Dr. Sarah Johnson',
    date: '2024-03-28',
    balanceAfter: 750.50,
  },
  {
    id: '3',
    type: 'debit',
    amount: -45.99,
    description: 'Pharmacy Order',
    date: '2024-03-27',
    balanceAfter: 900.49,
  },
  {
    id: '4',
    type: 'credit',
    amount: 200,
    description: 'Refund - Cancelled Appointment',
    date: '2024-03-25',
    balanceAfter: 946.48,
  },
];

export default function WalletScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header title="Wallet" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View className="px-4 py-4">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700">
            <View className="items-center py-4">
              <Text className="text-white/80 text-sm mb-1">Available Balance</Text>
              <Text className="text-4xl font-bold text-white mb-4">
                ${balance.toFixed(2)}
              </Text>
              <View className="flex-row gap-3">
                <Button
                  title="Add Funds"
                  onPress={() => {}}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={16} color="#FFFFFF" />}
                />
                <Button
                  title="Withdraw"
                  onPress={() => {}}
                  variant="outline"
                  size="sm"
                  className="border-white/50"
                >
                  <Text className="text-white">Withdraw</Text>
                </Button>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-2">
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4">
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mb-2">
                  <Plus size={20} color="#4F46E5" />
                </View>
                <Text className="text-sm font-medium text-gray-900">Add Money</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4">
                <View className="w-10 h-10 rounded-full bg-success-100 items-center justify-center mb-2">
                  <CreditCard size={20} color="#10B981" />
                </View>
                <Text className="text-sm font-medium text-gray-900">Pay Bills</Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions */}
        <View className="px-4 py-4 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary-600 font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <Card>
            <View className="gap-3">
              {transactions.map((transaction, index) => (
                <View
                  key={transaction.id}
                  className={cn(
                    'flex-row items-center gap-3',
                    index !== transactions.length - 1 && 'pb-3 border-b border-gray-100'
                  )}
                >
                  <View
                    className={cn(
                      'w-10 h-10 rounded-full items-center justify-center',
                      transaction.type === 'credit' ? 'bg-success-100' : 'bg-primary-100'
                    )}
                  >
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft size={20} color="#10B981" />
                    ) : (
                      <ArrowUpRight size={20} color="#4F46E5" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Clock size={12} color="#6B7280" />
                      <Text className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={cn(
                      'text-base font-semibold',
                      transaction.type === 'credit' ? 'text-success-600' : 'text-gray-900'
                    )}
                  >
                    {transaction.type === 'credit' ? '+' : ''}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
