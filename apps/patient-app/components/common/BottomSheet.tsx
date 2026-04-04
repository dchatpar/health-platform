import React, { useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { cn } from '@/lib/utils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  className?: string;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  snapPoints = [0.5],
  className,
}: BottomSheetProps) {
  const snapPoint = snapPoints[0] * SCREEN_HEIGHT;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View
              className={cn(
                'bg-white rounded-t-3xl max-h-full',
                className
              )}
              style={{ minHeight: snapPoint }}
            >
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="w-10" />
                <Text className="text-lg font-semibold text-gray-900">{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 items-center justify-center"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View className="flex-1 p-4">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
