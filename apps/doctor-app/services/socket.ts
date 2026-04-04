import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = await SecureStore.getItemAsync('auth_token');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('socket:connected', null);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('socket:disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('socket:error', error);
    });

    // Re-emit stored events
    this.socket.onAny((event, ...args) => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(...args);
          } catch (e) {
            console.error(`Error in socket listener for ${event}:`, e);
          }
        });
      }
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler?: Function): void {
    if (!handler) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(handler);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Specific emit methods for common events
  emitMessage(message: any): void {
    this.emit('message', message);
  }

  emitTyping(consultationId: string, isTyping: boolean): void {
    this.emit('typing', { consultationId, isTyping });
  }

  emitConsultationSignal(consultationId: string, type: string, payload: any): void {
    this.emit('consultation:signal', { consultationId, type, payload });
  }

  emitJoinConsultation(consultationId: string): void {
    this.emit('consultation:join', { consultationId });
  }

  emitLeaveConsultation(consultationId: string): void {
    this.emit('consultation:leave', { consultationId });
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
