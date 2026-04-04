import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Send, Paperclip, Mic } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  onAttachFile,
  placeholder = 'Type a message...',
  disabled = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <View
      className={cn(
        'flex-row items-end gap-2 p-4 bg-white border-t border-gray-200',
        className
      )}
    >
      {onAttachFile && (
        <TouchableOpacity
          onPress={onAttachFile}
          disabled={disabled}
          className="w-10 h-10 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Paperclip size={22} color="#6B7280" />
        </TouchableOpacity>
      )}

      <View className="flex-1 flex-row items-end bg-gray-100 rounded-2xl px-4 py-2">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
          className="flex-1 text-gray-900 text-base max-h-[100px]"
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled || !message.trim()}
        className={cn(
          'w-10 h-10 rounded-full items-center justify-center',
          message.trim() ? 'bg-primary-600' : 'bg-gray-300'
        )}
      >
        <Send size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
