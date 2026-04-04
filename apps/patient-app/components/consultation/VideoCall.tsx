import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RTCView, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import { Video, VideoOff, Mic, MicOff, Phone, Monitor, Camera } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface VideoCallProps {
  roomId: string;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  onEndCall: () => void;
  isConnecting?: boolean;
  className?: string;
}

export function VideoCall({
  roomId,
  localStream,
  remoteStream,
  onEndCall,
  isConnecting = false,
  className,
}: VideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleAudio = () => setIsAudioEnabled(!isAudioEnabled);

  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    // In a real implementation, this would switch the camera
  };

  return (
    <View className={cn('flex-1 bg-gray-900', className)}>
      {/* Remote Video (Full Screen) */}
      <View className="flex-1">
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            {isConnecting ? (
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-gray-800 items-center justify-center mb-4">
                  <Video size={40} color="#FFFFFF" />
                </View>
                <Text className="text-white text-lg font-medium">Connecting...</Text>
                <Text className="text-gray-400 text-sm mt-2">
                  Waiting for the doctor to join
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-gray-800 items-center justify-center mb-4">
                  <VideoOff size={40} color="#FFFFFF" />
                </View>
                <Text className="text-white text-lg font-medium">No Video</Text>
                <Text className="text-gray-400 text-sm mt-2">
                  Doctor's video is unavailable
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Local Video (Picture in Picture) */}
      {localStream && isVideoEnabled && (
        <View style={styles.localVideoContainer} className="absolute top-4 right-4">
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={isFrontCamera}
          />
        </View>
      )}

      {/* Controls */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity
            onPress={toggleAudio}
            className={cn(
              'w-14 h-14 rounded-full items-center justify-center',
              isAudioEnabled ? 'bg-gray-700' : 'bg-error-600'
            )}
          >
            {isAudioEnabled ? (
              <Mic size={24} color="#FFFFFF" />
            ) : (
              <MicOff size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleVideo}
            className={cn(
              'w-14 h-14 rounded-full items-center justify-center',
              isVideoEnabled ? 'bg-gray-700' : 'bg-error-600'
            )}
          >
            {isVideoEnabled ? (
              <Video size={24} color="#FFFFFF" />
            ) : (
              <VideoOff size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={switchCamera}
            className="w-14 h-14 rounded-full bg-gray-700 items-center justify-center"
          >
            <Camera size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onEndCall}
            className="w-14 h-14 rounded-full bg-error-600 items-center justify-center"
          >
            <Phone size={24} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  remoteVideo: {
    flex: 1,
  },
  localVideoContainer: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
});
