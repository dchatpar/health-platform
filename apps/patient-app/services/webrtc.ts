import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { socketService } from './socket';
import { WEBRTC_CONFIG } from '@/lib/constants';

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomId: string | null = null;

  private onLocalStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: string) => void) | null = null;

  async initialize(roomId: string) {
    this.roomId = roomId;

    try {
      // Get local media stream
      this.localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      this.onLocalStreamCallback?.(this.localStream);

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(WEBRTC_CONFIG);

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Handle incoming tracks
      this.peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          this.remoteStream = remoteStream;
          this.onRemoteStreamCallback?.(remoteStream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendIceCandidate(this.roomId!, event.candidate);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'unknown';
        this.onConnectionStateChangeCallback?.(state);
      };

      // Set up socket event listeners for signaling
      this.setupSignalingListeners();

      // Join the room
      socketService.joinConsultation(roomId);

      return this.localStream;
    } catch (error) {
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  private setupSignalingListeners() {
    socketService.on('offer', async ({ sdp }: { sdp: RTCSessionDescription }) => {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        socketService.sendAnswer(this.roomId!, answer);
      }
    });

    socketService.on('answer', async ({ sdp }: { sdp: RTCSessionDescription }) => {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socketService.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidate }) => {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  async createOffer() {
    if (this.peerConnection && this.roomId) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      socketService.sendOffer(this.roomId, offer);
    }
  }

  async toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  async toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  async switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // @ts-ignore - facingMode might not be in the type
        const currentFacing = videoTrack.getSettings?.().facingMode;
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        const newStream = await mediaDevices.getUserMedia({
          video: { facingMode: newFacing },
        });

        const newVideoTrack = newStream.getVideoTracks()[0];

        if (this.peerConnection) {
          const sender = this.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }

        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);
        videoTrack.stop();

        this.onLocalStreamCallback?.(this.localStream);
      }
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'unknown';
  }

  onLocalStream(callback: (stream: MediaStream) => void) {
    this.onLocalStreamCallback = callback;
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback;
  }

  onConnectionStateChange(callback: (state: string) => void) {
    this.onConnectionStateChangeCallback = callback;
  }

  async cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.roomId) {
      socketService.leaveConsultation(this.roomId);
      this.roomId = null;
    }
  }
}

export const webrtcService = new WebRTCService();
