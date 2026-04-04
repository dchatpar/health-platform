import { useState, useCallback, useEffect, useRef } from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
  mediaDevices,
} from 'react-native-webrtc';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const configurationRef = useRef(ICE_SERVERS);

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      setError(null);
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setLocalStream(stream);
      return stream;
    } catch (err: any) {
      console.error('Error getting media:', err);
      setError(err.message || 'Failed to access camera/microphone');
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(configurationRef.current);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'connected':
          setIsConnected(true);
          setIsConnecting(false);
          break;
        case 'disconnected':
        case 'failed':
          setIsConnected(false);
          setIsConnecting(false);
          break;
        case 'closed':
          setIsConnected(false);
          break;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream]);

  // Start a call (create offer)
  const startCall = useCallback(
    async (targetUserId: string) => {
      setIsConnecting(true);
      setError(null);

      try {
        // Initialize media if not already done
        const stream = localStream || (await initializeMedia());
        if (!stream) {
          throw new Error('Failed to get media stream');
        }

        const pc = createPeerConnection();

        // Create offer
        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);

        // In production, send offer to signaling server
        console.log('Offer created, sending to:', targetUserId);

        return offer;
      } catch (err: any) {
        console.error('Error starting call:', err);
        setError(err.message || 'Failed to start call');
        setIsConnecting(false);
        return null;
      }
    },
    [localStream, initializeMedia, createPeerConnection]
  );

  // Answer a call (receive offer)
  const answerCall = useCallback(
    async (offer: RTCSessionDescription) => {
      setIsConnecting(true);
      setError(null);

      try {
        const stream = localStream || (await initializeMedia());
        if (!stream) {
          throw new Error('Failed to get media stream');
        }

        const pc = createPeerConnection();

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // In production, send answer to signaling server
        console.log('Answer created');

        return answer;
      } catch (err: any) {
        console.error('Error answering call:', err);
        setError(err.message || 'Failed to answer call');
        setIsConnecting(false);
        return null;
      }
    },
    [localStream, initializeMedia, createPeerConnection]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescription) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (err: any) {
      console.error('Error handling answer:', err);
      setError(err.message || 'Failed to handle answer');
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (err: any) {
      console.error('Error adding ICE candidate:', err);
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Get current facing mode
        const settings = videoTrack.getSettings();
        const currentFacing = settings.facingMode || 'user';
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        // Stop current track
        videoTrack.stop();

        // Get new stream with different facing mode
        const newStream = await mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: newFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // Replace track in peer connection
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === 'video');
          if (sender && newStream.getVideoTracks()[0]) {
            await sender.replaceTrack(newStream.getVideoTracks()[0]);
          }
        }

        setLocalStream(newStream);
      }
    }
  }, [localStream]);

  // End call
  const endCall = useCallback(() => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, [localStream, remoteStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isCameraEnabled,
    isMicrophoneEnabled,
    error,
    initializeMedia,
    startCall,
    answerCall,
    handleAnswer,
    handleIceCandidate,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
    endCall,
  };
}
