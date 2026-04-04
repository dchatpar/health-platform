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
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream | null) => void) | null = null;
  private onConnectionStateCallback: ((state: string) => void) | null = null;
  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;

  async initializeLocalStream(videoEnabled = true, audioEnabled = true): Promise<MediaStream | null> {
    try {
      this.localStream = await mediaDevices.getUserMedia({
        audio: audioEnabled,
        video: videoEnabled
          ? {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
      });
      return this.localStream;
    } catch (error) {
      console.error('Error getting local media stream:', error);
      return null;
    }
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamCallback?.(this.remoteStream);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'unknown';
      console.log('Connection state:', state);
      this.onConnectionStateCallback?.(state);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidateCallback?.(event.candidate);
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    return this.peerConnection;
  }

  async createOffer(): Promise<RTCSessionDescription | null> {
    try {
      const pc = await this.createPeerConnection();
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  async createAnswer(offer: RTCSessionDescription): Promise<RTCSessionDescription | null> {
    try {
      const pc = await this.createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }

  async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  toggleCamera(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  toggleMicrophone(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  async switchCamera(): Promise<void> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        const currentFacing = videoTrack.getSettings().facingMode;
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        // Stop current track
        videoTrack.stop();

        // Get new stream
        const newStream = await mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: newFacing },
        });

        const newVideoTrack = newStream.getVideoTracks()[0];

        // Replace track in peer connection
        if (this.peerConnection) {
          const sender = this.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === 'video');
          if (sender && newVideoTrack) {
            await sender.replaceTrack(newVideoTrack);
          }
        }

        // Update local stream
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);
      }
    }
  }

  // Event handlers
  onRemoteStream(callback: (stream: MediaStream | null) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionState(callback: (state: string) => void): void {
    this.onConnectionStateCallback = callback;
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }

  // Cleanup
  cleanup(): void {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear callbacks
    this.onRemoteStreamCallback = null;
    this.onConnectionStateCallback = null;
    this.onIceCandidateCallback = null;
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }
}

export const webrtcService = new WebRTCService();
