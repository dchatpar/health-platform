import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';

interface AcceptRejectButtonsProps {
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export function AcceptRejectButtons({
  onAccept,
  onReject,
  disabled = false,
}: AcceptRejectButtonsProps) {
  return (
    <View className="flex-row gap-3">
      <Button
        variant="outline"
        onPress={onReject}
        disabled={disabled}
        className="flex-1 h-12 border-error-200"
      >
        <Text className="text-error-600 font-semibold">Decline</Text>
      </Button>
      <Button
        onPress={onAccept}
        disabled={disabled}
        className="flex-1 h-12"
      >
        <Text className="text-white font-semibold">Accept</Text>
      </Button>
    </View>
  );
}

function Text({ className, children }: { className?: string; children: React.ReactNode }) {
  return <>{children}</>;
}
