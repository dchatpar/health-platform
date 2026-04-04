import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { SOCKET_URL } from '@/lib/constants';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = useAuthStore.getState().token;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Consultation events
  joinConsultation(consultationId: string) {
    this.socket?.emit('join-consultation', { consultationId });
  }

  leaveConsultation(consultationId: string) {
    this.socket?.emit('leave-consultation', { consultationId });
  }

  sendMessage(consultationId: string, message: string, type: 'text' | 'image' | 'file' = 'text') {
    this.socket?.emit('send-message', { consultationId, message, type });
  }

  sendTyping(consultationId: string) {
    this.socket?.emit('typing', { consultationId });
  }

  // Video call signaling
  sendOffer(consultationId: string, sdp: RTCSessionDescription) {
    this.socket?.emit('offer', { consultationId, sdp });
  }

  sendAnswer(consultationId: string, sdp: RTCSessionDescription) {
    this.socket?.emit('answer', { consultationId, sdp });
  }

  sendIceCandidate(consultationId: string, candidate: RTCIceCandidate) {
    this.socket?.emit('ice-candidate', { consultationId, candidate });
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Also add to socket if connected
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      // Remove all listeners for this event
      this.listeners.get(event)?.forEach((cb) => {
        this.socket?.off(event, cb);
      });
      this.listeners.delete(event);
    }
  }

  // Once listener
  once(event: string, callback: Function) {
    this.socket?.once(event, callback);
  }
}

export const socketService = new SocketService();
