import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { DoctorCard } from './DoctorCard';
import { EmptyView } from '../common/Empty';
import { Loading } from '../common/Loading';
import { cn } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

interface DoctorListProps {
  doctors: Doctor[];
  isLoading?: boolean;
  onDoctorPress: (doctor: Doctor) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
  className?: string;
}

export function DoctorList({
  doctors,
  isLoading,
  onDoctorPress,
  onRefresh,
  isRefreshing,
  ListHeaderComponent,
  className,
}: DoctorListProps) {
  if (isLoading && doctors.length === 0) {
    return (
      <View className={cn('flex-1 items-center justify-center py-20', className)}>
        <Loading text="Loading doctors..." />
      </View>
    );
  }

  if (doctors.length === 0) {
    return (
      <EmptyView
        title="No doctors found"
        description="Try adjusting your search filters"
        className={className}
      />
    );
  }

  return (
    <FlashList
      data={doctors}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DoctorCard
          doctor={item}
          onPress={() => onDoctorPress(item)}
          className="mx-4 mb-3"
        />
      )}
      ListHeaderComponent={ListHeaderComponent}
      estimatedItemSize={180}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentContainerClassName="py-4"
      className={className}
    />
  );
}
