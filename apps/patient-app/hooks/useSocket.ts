import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/lib/types';

interface UseSocketOptions {
  consultationId?: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onTyping?: (data: { senderId: string; senderType: string }) => void;
  onUserJoined?: (data: { userId: string }) => void;
  onUserLeft?: (data: { userId: string }) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { consultationId, onMessageReceived, onTyping, onUserJoined, onUserLeft } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (!token) return;

    const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      if (consultationId) {
        socket.emit('join-consultation', { consultationId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      onMessageReceived?.(message);
    });

    socket.on('typing', (data) => {
      onTyping?.(data);
    });

    socket.on('user-joined', (data) => {
      onUserJoined?.(data);
    });

    socket.on('user-left', (data) => {
      onUserLeft?.(data);
    });

    socketRef.current = socket;
  }, [token, consultationId, onMessageReceived, onTyping, onUserJoined, onUserLeft]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (message: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
      if (socketRef.current && consultationId) {
        const payload = {
          consultationId,
          message,
          type,
          fileUrl,
        };
        socketRef.current.emit('send-message', payload);
      }
    },
    [consultationId]
  );

  const sendTyping = useCallback(() => {
    if (socketRef.current && consultationId) {
      socketRef.current.emit('typing', { consultationId });
    }
  }, [consultationId]);

  const joinConsultation = useCallback(
    (id: string) => {
      if (socketRef.current) {
        socketRef.current.emit('join-consultation', { consultationId: id });
      }
    },
    []
  );

  const leaveConsultation = useCallback(
    (id: string) => {
      if (socketRef.current) {
        socketRef.current.emit('leave-consultation', { consultationId: id });
      }
    },
    []
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    sendMessage,
    sendTyping,
    joinConsultation,
    leaveConsultation,
    disconnect,
    connect,
  };
}
