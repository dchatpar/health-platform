import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSocket } from '@/hooks/useSocket';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { consultationStore } from '@/store/consultationStore';
import { VideoCall } from '@/components/consultation/VideoCall';
import { ChatBubble } from '@/components/consultation/ChatBubble';
import { Button } from '@/components/ui/Button';

export default function ConsultationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { doctor } = useAuth();
  const { getAppointmentById, completeAppointment } = useAppointments();
  const { localStream, remoteStream, isConnected, toggleCamera, toggleMicrophone, switchCamera, endCall } =
    useWebRTC();
  const { socket, sendMessage, messages } = useSocket();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const appointment = getAppointmentById(id);
  const { setActiveConsultation, endConsultation, notes, setNotes } = consultationStore();

  useEffect(() => {
    if (id) {
      setActiveConsultation(id, appointment?.patient?.name || 'Patient');
    }
    return () => {
      endConsultation();
    };
  }, [id, appointment?.patient?.name, setActiveConsultation, endConsultation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleEndConsultation();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleSendMessage = useCallback(() => {
    if (chatMessage.trim() && socket) {
      sendMessage({
        type: 'chat',
        content: chatMessage.trim(),
        senderId: doctor?.id,
        senderName: doctor?.name,
        timestamp: new Date().toISOString(),
      });
      setChatMessage('');
    }
  }, [chatMessage, socket, sendMessage, doctor]);

  const handleEndConsultation = useCallback(() => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            endCall();
            if (notes) {
              await saveNotes();
            }
            router.replace('/(tabs)');
          },
        },
      ]
    );
  }, [notes, router, endCall]);

  const saveNotes = async () => {
    console.log('Saving notes:', notes);
  };

  const handleCompleteAndPrescribe = () => {
    endCall();
    router.push(`/consultation/prescribe?id=${id}`);
  };

  const handleAddOrder = () => {
    endCall();
    router.push(`/consultation/order?id=${id}`);
  };

  const handleAddNotes = () => {
    router.push(`/consultation/notes?id=${id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!appointment) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white">Consultation not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-gray-800">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white font-semibold">
              {appointment.patient?.name || 'Patient'}
            </Text>
            <Text className="text-gray-400 text-sm">
              {format(parseISO(appointment.scheduledAt), 'MMM d, h:mm a')}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <View className="bg-gray-700 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-mono">{formatTime(elapsedTime)}</Text>
          </View>
          <View
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-success-500' : 'bg-error-500'
            }`}
          />
        </View>
      </View>

      {/* Video Area */}
      <VideoCall
        localStream={localStream}
        remoteStream={remoteStream}
        isConnected={isConnected}
        onToggleCamera={toggleCamera}
        onToggleMicrophone={toggleMicrophone}
        onSwitchCamera={switchCamera}
        onToggleChat={() => setShowChat(!showChat)}
        showChat={showChat}
      />

      {/* Chat Panel */}
      {showChat && (
        <View className="absolute bottom-24 left-0 right-0 h-64 bg-gray-800 border-t border-gray-700">
          <View className="flex-1 p-4">
            <View className="flex-1 gap-2 mb-3">
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  message={msg}
                  isOwnMessage={msg.senderId === doctor?.id}
                />
              ))}
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-gray-700 rounded-full px-4 py-2">
                <Text className="text-white">Type a message...</Text>
              </View>
              <TouchableOpacity
                onPress={handleSendMessage}
                className="w-10 h-10 bg-primary-600 rounded-full items-center justify-center"
              >
                <Text className="text-white">➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View className="absolute bottom-24 left-4 right-4">
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            onPress={handleAddNotes}
            className="px-4 py-2 bg-gray-700 rounded-full"
          >
            <Text className="text-white text-sm">📝 Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddOrder}
            className="px-4 py-2 bg-gray-700 rounded-full"
          >
            <Text className="text-white text-sm">🧪 Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCompleteAndPrescribe}
            className="px-4 py-2 bg-gray-700 rounded-full"
          >
            <Text className="text-white text-sm">💊 Prescribe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-gray-800 px-4 py-4">
        <View className="flex-row justify-center gap-6 mb-4">
          <TouchableOpacity
            onPress={toggleMicrophone}
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          >
            <Text className="text-white text-xl">🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleCamera}
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          >
            <Text className="text-white text-xl">📹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={switchCamera}
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          >
            <Text className="text-white text-xl">🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowChat(!showChat)}
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          >
            <Text className="text-white text-xl">💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEndConsultation}
            className="w-12 h-12 bg-error-600 rounded-full items-center justify-center"
          >
            <Text className="text-white text-xl">📞</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <Button
            variant="outline"
            onPress={handleAddOrder}
            className="flex-1 h-12 border-gray-600"
          >
            <Text className="text-white font-semibold">Order Tests</Text>
          </Button>
          <Button
            onPress={handleCompleteAndPrescribe}
            className="flex-1 h-12 bg-success-600"
          >
            <Text className="text-white font-semibold">Complete</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
