import React from 'react';
import { View, Text, Stepper } from 'react-native';
import { Check, Clock, Package, Truck, Home } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

interface OrderTrackerProps {
  status: OrderStatus;
  className?: string;
}

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Order Placed', icon: <Clock size={16} /> },
  { status: 'confirmed', label: 'Confirmed', icon: <Check size={16} /> },
  { status: 'preparing', label: 'Preparing', icon: <Package size={16} /> },
  { status: 'dispatched', label: 'On the way', icon: <Truck size={16} /> },
  { status: 'delivered', label: 'Delivered', icon: <Home size={16} /> },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  dispatched: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderTracker({ status, className }: OrderTrackerProps) {
  const currentIndex = statusIndex[status];
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <View className={cn('p-4 bg-error-50 rounded-xl', className)}>
        <Text className="text-error-600 font-medium text-center">
          Order Cancelled
        </Text>
      </View>
    );
  }

  return (
    <View className={cn('p-4 bg-white rounded-xl', className)}>
      <Text className="text-base font-semibold text-gray-900 mb-4">
        Order Status
      </Text>
      <View className="flex-row items-start">
        {ORDER_STEPS.slice(0, -1).map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === ORDER_STEPS.length - 2;

          return (
            <View key={step.status} className="flex-1 flex-row items-start">
              <View className="items-center">
                <View
                  className={cn(
                    'w-8 h-8 rounded-full items-center justify-center',
                    isCompleted || isCurrent
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                  )}
                >
                  <Text className={isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}>
                    {isCompleted ? <Check size={16} color="#FFFFFF" /> : step.icon}
                  </Text>
                </View>
                <Text
                  className={cn(
                    'text-xs mt-1 text-center',
                    isCompleted || isCurrent ? 'text-primary-600 font-medium' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </Text>
              </View>
              {!isLast && (
                <View
                  className={cn(
                    'flex-1 h-0.5 mt-4',
                    index < currentIndex ? 'bg-primary-600' : 'bg-gray-200'
                  )}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
