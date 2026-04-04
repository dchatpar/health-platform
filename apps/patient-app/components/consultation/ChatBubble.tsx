import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  className?: string;
}

export function ChatBubble({ message, isOwnMessage, className }: ChatBubbleProps) {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      className={cn(
        'max-w-[80%] mb-3',
        isOwnMessage ? 'self-end' : 'self-start',
        className
      )}
    >
      <View
        className={cn(
          'rounded-2xl px-4 py-2',
          isOwnMessage
            ? 'bg-primary-600 rounded-br-md'
            : 'bg-gray-100 rounded-bl-md'
        )}
      >
        <Text
          className={cn(
            'text-base',
            isOwnMessage ? 'text-white' : 'text-gray-900'
          )}
        >
          {message.message}
        </Text>
      </View>
      <View
        className={cn(
          'flex-row items-center gap-1 mt-1 px-1',
          isOwnMessage ? 'justify-end' : 'justify-start'
        )}
      >
        <Text className="text-xs text-gray-500">{formatTime(message.createdAt)}</Text>
        {!isOwnMessage && message.readAt && (
          <Text className="text-xs text-primary-600">Read</Text>
        )}
      </View>
    </View>
  );
}
