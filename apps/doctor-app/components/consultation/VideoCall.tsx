import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onSwitchCamera: () => void;
  onToggleChat: () => void;
  showChat: boolean;
}

export function VideoCall({
  localStream,
  remoteStream,
  isConnected,
  onToggleCamera,
  onToggleMicrophone,
  onSwitchCamera,
  onToggleChat,
  showChat,
}: VideoCallProps) {
  return (
    <View className="flex-1 bg-gray-900">
      {/* Remote Video (Full Screen) */}
      {isConnected && remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
          mirror={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-gray-700 items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-white text-lg mb-2">Connecting...</Text>
          <Text className="text-gray-400 text-sm">
            Waiting for patient to join
          </Text>
        </View>
      )}

      {/* Local Video (Picture in Picture) */}
      {localStream && (
        <View className="absolute top-4 right-4 w-28 h-40 rounded-xl overflow-hidden shadow-lg border-2 border-white">
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
          <TouchableOpacity
            onPress={onSwitchCamera}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
          >
            <Text className="text-white text-xs">🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Connection Status */}
      <View className="absolute top-4 left-4">
        <View
          className={`px-3 py-1.5 rounded-full ${
            isConnected ? 'bg-success-500' : 'bg-warning-500'
          }`}
        >
          <Text className="text-white text-xs font-medium">
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  remoteVideo: {
    flex: 1,
  },
  localVideo: {
    flex: 1,
  },
});
