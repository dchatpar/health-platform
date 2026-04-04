import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  MoreVertical,
  FileText,
  ChevronLeft,
} from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/common/Header';
import { ChatBubble } from '@/components/consultation/ChatBubble';
import { ChatInput } from '@/components/consultation/ChatInput';
import { cn } from '@/lib/utils';

const mockConsultation = {
  id: '1',
  doctor: {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    avatar: undefined,
    specialty: 'Cardiologist',
  },
  status: 'in-progress',
  type: 'video',
  startTime: new Date().toISOString(),
  notes: 'Follow-up consultation for blood pressure management',
  diagnosis: 'Hypertension - Stage 1',
};

const mockMessages = [
  {
    id: '1',
    consultationId: '1',
    senderId: 'doctor-1',
    senderType: 'doctor' as const,
    message: 'Hello! How are you feeling today?',
    type: 'text' as const,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '2',
    consultationId: '1',
    senderId: 'patient-1',
    senderType: 'patient' as const,
    message: 'Hi Dr. Johnson! I\'ve been feeling better since starting the medication.',
    type: 'text' as const,
    createdAt: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: '3',
    consultationId: '1',
    senderId: 'doctor-1',
    senderType: 'doctor' as const,
    message: 'That\'s great to hear! Let\'s review your blood pressure readings.',
    type: 'text' as const,
    createdAt: new Date(Date.now() - 180000).toISOString(),
  },
];

type TabType = 'video' | 'chat';

export default function ConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLocalStream, setIsLocalStream] = useState<MediaStream | null>(null);
  const [isRemoteStream, setIsRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [messages, setMessages] = useState(mockMessages);

  const consultation = mockConsultation;

  useEffect(() => {
    // Simulate connecting to video call
    const timer = setTimeout(() => {
      setIsConnecting(false);
      // In a real implementation, this would initialize WebRTC
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleAudio = () => setIsAudioEnabled(!isAudioEnabled);

  const handleEndCall = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      consultationId: id!,
      senderId: 'patient-1',
      senderType: 'patient' as const,
      message,
      type: 'text' as const,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-white font-semibold">
            Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}
          </Text>
          <Text className="text-sm text-gray-400">
            {isConnecting ? 'Connecting...' : 'In Progress'}
          </Text>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <MoreVertical size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row bg-gray-800">
        <TouchableOpacity
          onPress={() => setActiveTab('video')}
          className={cn(
            'flex-1 py-3 items-center',
            activeTab === 'video' && 'border-b-2 border-primary-600'
          )}
        >
          <Video
            size={20}
            color={activeTab === 'video' ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('chat')}
          className={cn(
            'flex-1 py-3 items-center',
            activeTab === 'chat' && 'border-b-2 border-primary-600'
          )}
        >
          <MessageSquare
            size={20}
            color={activeTab === 'chat' ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'video' ? (
        <View className="flex-1">
          {/* Remote Video */}
          <View className="flex-1 bg-gray-900">
            {isConnecting ? (
              <View className="flex-1 items-center justify-center">
                <Avatar
                  src={consultation.doctor.avatar}
                  name={`${consultation.doctor.firstName} ${consultation.doctor.lastName}`}
                  size="xl"
                />
                <Text className="text-white text-lg mt-4">
                  Connecting to Dr. {consultation.doctor.lastName}...
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <Avatar
                  src={consultation.doctor.avatar}
                  name={`${consultation.doctor.firstName} ${consultation.doctor.lastName}`}
                  size="xl"
                />
                <Text className="text-white text-lg mt-4">
                  Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}
                </Text>
                <Text className="text-gray-400">Video call active</Text>
              </View>
            )}
          </View>

          {/* Local Video */}
          {isLocalStream && isVideoEnabled && (
            <View className="absolute top-4 right-4 w-28 h-36 rounded-xl overflow-hidden border-2 border-white">
              <RTCView
                streamURL={isLocalStream.toURL()}
                style={{ width: '100%', height: '100%' }}
                objectFit="cover"
              />
            </View>
          )}

          {/* Video Controls */}
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
                onPress={handleEndCall}
                className="w-14 h-14 rounded-full bg-error-600 items-center justify-center"
              >
                <Phone
                  size={24}
                  color="#FFFFFF"
                  style={{ transform: [{ rotate: '135deg' }] }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1 bg-white">
          {/* Chat Messages */}
          <FlashList
            data={messages}
            keyExtractor={(item) => item.id}
            estimatedItemSize={80}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isOwnMessage={item.senderType === 'patient'}
              />
            )}
            contentContainerClassName="p-4"
          />

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}
