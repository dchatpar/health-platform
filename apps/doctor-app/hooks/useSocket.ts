import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authStore } from '@/store/authStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

interface Message {
  id?: string;
  type: 'chat' | 'file' | 'system';
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
  };
}

interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface OnlineStatus {
  userId: string;
  isOnline: boolean;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const { doctor, isAuthenticated, token } = authStore();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      console.log('Cannot connect: not authenticated');
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join doctor's personal room
      if (doctor) {
        newSocket.emit('join', `doctor:${doctor.id}`);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, manually reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        newSocket.disconnect();
      }
    });

    // Chat events
    newSocket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('message:read', ({ messageId, readAt }: { messageId: string; readAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, readAt } : msg
        )
      );
    });

    // Typing events
    newSocket.on('typing', (status: TypingStatus) => {
      setTypingUsers((prev) => {
        const existing = prev.findIndex((u) => u.userId === status.userId);
        if (status.isTyping) {
          if (existing >= 0) {
            return prev;
          }
          return [...prev, status];
        } else {
          return prev.filter((u) => u.userId !== status.userId);
        }
      });
    });

    // Online status events
    newSocket.on('online', ({ userId, isOnline }: OnlineStatus) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    // Consultation events
    newSocket.on('consultation:start', (data: { appointmentId: string }) => {
      console.log('Consultation started:', data);
      // Handle consultation start
    });

    newSocket.on('consultation:end', (data: { appointmentId: string }) => {
      console.log('Consultation ended:', data);
      // Handle consultation end
    });

    newSocket.on('consultation:signal', (data: { type: string; payload: any }) => {
      console.log('Consultation signal:', data);
      // Handle WebRTC signaling
    });

    setSocket(newSocket);

    return newSocket;
  }, [isAuthenticated, token, doctor]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Send message
  const sendMessage = useCallback(
    (message: Omit<Message, 'id' | 'timestamp'>) => {
      if (socket && isConnected) {
        const fullMessage: Message = {
          ...message,
          id: `msg_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        socket.emit('message', fullMessage);
        setMessages((prev) => [...prev, fullMessage]);
      }
    },
    [socket, isConnected]
  );

  // Send typing status
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (socket && isConnected && doctor) {
        socket.emit('typing', {
          userId: doctor.id,
          userName: doctor.name,
          isTyping,
        });
      }
    },
    [socket, isConnected, doctor]
  );

  // Join consultation room
  const joinConsultation = useCallback(
    (appointmentId: string) => {
      if (socket && isConnected) {
        socket.emit('consultation:join', { appointmentId });
      }
    },
    [socket, isConnected]
  );

  // Leave consultation room
  const leaveConsultation = useCallback(
    (appointmentId: string) => {
      if (socket && isConnected) {
        socket.emit('consultation:leave', { appointmentId });
      }
    },
    [socket, isConnected]
  );

  // Send consultation signal
  const sendConsultationSignal = useCallback(
    (appointmentId: string, type: string, payload: any) => {
      if (socket && isConnected) {
        socket.emit('consultation:signal', {
          appointmentId,
          type,
          payload,
        });
      }
    },
    [socket, isConnected]
  );

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = connect();
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    connect,
    disconnect,
    sendMessage,
    sendTypingStatus,
    joinConsultation,
    leaveConsultation,
    sendConsultationSignal,
  };
}
