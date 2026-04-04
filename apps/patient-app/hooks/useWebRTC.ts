import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { useConsultationStore } from '@/store/consultationStore';
import { WEBRTC_CONFIG } from '@/lib/constants';

interface UseWebRTCOptions {
  roomId: string;
  onRemoteStream?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
}

export function useWebRTC({ roomId, onRemoteStream, onError }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { setLocalStream: setStoreLocalStream, setRemoteStream: setStoreRemoteStream } =
    useConsultationStore();

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      setLocalStream(stream);
      setStoreLocalStream(stream);
      return stream;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [setStoreLocalStream, onError]);

  const createPeerConnection = useCallback(
    async (stream: MediaStream) => {
      const pc = new RTCPeerConnection(WEBRTC_CONFIG);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to signaling server
          // socket.emit('ice-candidate', { candidate: event.candidate, roomId });
        }
      };

      pc.ontrack = (event) => {
        const [remote] = event.streams;
        if (remote) {
          setRemoteStream(remote);
          setStoreRemoteStream(remote);
          onRemoteStream?.(remote);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed'
        ) {
          setIsConnected(false);
        }
      };

      return pc;
    },
    [roomId, onRemoteStream, setStoreRemoteStream]
  );

  const startCall = useCallback(async () => {
    setIsConnecting(true);
    try {
      const stream = await initializeMedia();
      await createPeerConnection(stream);

      // In a real implementation, you would:
      // 1. Connect to signaling server (Socket.IO)
      // 2. Create or join a room
      // 3. Exchange SDP offers/answers
      // 4. Exchange ICE candidates

      // For demo purposes, we'll simulate a successful connection
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
      }, 2000);
    } catch (err) {
      setIsConnecting(false);
    }
  }, [initializeMedia, createPeerConnection]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setStoreLocalStream(null);
    setStoreRemoteStream(null);
  }, [localStream, setStoreLocalStream, setStoreRemoteStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  const switchCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        // @ts-ignore - facingMode might not be on MediaStreamTrack
        const currentFacing = videoTrack.getSettings?.().facingMode;
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        mediaDevices
          .getUserMedia({
            video: { facingMode: newFacing },
          })
          .then((newStream) => {
            const newVideoTrack = newStream.getVideoTracks()[0];
            if (peerConnectionRef.current && newVideoTrack) {
              const sender = peerConnectionRef.current
                .getSenders()
                .find((s) => s.track?.kind === 'video');
              if (sender) {
                sender.replaceTrack(newVideoTrack);
              }
            }

            localStream.removeTrack(videoTrack);
            localStream.addTrack(newVideoTrack);
            videoTrack.stop();
          });
      }
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    switchCamera,
  };
}
