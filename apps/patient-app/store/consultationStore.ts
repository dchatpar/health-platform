import { create } from 'zustand';
import type { Consultation, ChatMessage, Doctor } from '@/lib/types';

interface ConsultationState {
  // Current consultation
  activeConsultation: Consultation | null;
  consultationType: 'video' | 'chat' | 'audio';

  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Chat
  messages: ChatMessage[];
  isTyping: boolean;
  typingUser: string | null;

  // UI State
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;

  // Actions
  setActiveConsultation: (consultation: Consultation | null) => void;
  setConsultationType: (type: 'video' | 'chat' | 'audio') => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setTyping: (isTyping: boolean, userId?: string) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenSharing: () => void;
  resetConsultation: () => void;
}

const initialState = {
  activeConsultation: null,
  consultationType: 'video' as const,
  localStream: null,
  remoteStream: null,
  messages: [],
  isTyping: false,
  typingUser: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
};

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  ...initialState,

  setActiveConsultation: (consultation) => set({ activeConsultation: consultation }),

  setConsultationType: (type) => set({ consultationType: type }),

  setLocalStream: (stream) => set({ localStream: stream }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setTyping: (isTyping, userId) =>
    set({
      isTyping,
      typingUser: userId || null,
    }),

  toggleVideo: () =>
    set((state) => {
      if (state.localStream) {
        const videoTrack = state.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
        }
      }
      return { isVideoEnabled: !state.isVideoEnabled };
    }),

  toggleAudio: () =>
    set((state) => {
      if (state.localStream) {
        const audioTrack = state.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
        }
      }
      return { isAudioEnabled: !state.isAudioEnabled };
    }),

  toggleScreenSharing: () =>
    set((state) => ({ isScreenSharing: !state.isScreenSharing })),

  resetConsultation: () => {
    const { localStream } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    set(initialState);
  },
}));
