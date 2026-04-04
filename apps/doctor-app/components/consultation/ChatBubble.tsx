import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';

interface Message {
  id?: string;
  type: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
}

interface ChatBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
  const formattedTime = format(parseISO(message.timestamp), 'h:mm a');

  return (
    <View
      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        isOwnMessage
          ? 'bg-primary-500 self-end rounded-br-sm'
          : 'bg-gray-700 self-start rounded-bl-sm'
      }`}
    >
      {!isOwnMessage && (
        <Text className="text-xs text-gray-400 mb-1">{message.senderName}</Text>
      )}
      <Text
        className={`text-base ${
          isOwnMessage ? 'text-white' : 'text-gray-100'
        }`}
      >
        {message.content}
      </Text>
      <Text
        className={`text-xs mt-1 ${
          isOwnMessage ? 'text-primary-200' : 'text-gray-400'
        }`}
      >
        {formattedTime}
      </Text>
    </View>
  );
}
