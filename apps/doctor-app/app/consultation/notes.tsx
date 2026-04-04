import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { consultationStore } from '@/store/consultationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function NotesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { doctor } = useAuth();
  const { notes, setNotes, activeConsultation, isEditingNotes, setIsEditingNotes } =
    consultationStore();

  const [localNotes, setLocalNotes] = useState(notes || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!activeConsultation) {
      Alert.alert('Error', 'No active consultation', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [activeConsultation, router]);

  useEffect(() => {
    setHasChanges(localNotes !== notes);
  }, [localNotes, notes]);

  const handleSave = () => {
    setNotes(localNotes);
    setIsEditingNotes(false);
    Alert.alert('Saved', 'Notes saved successfully');
  };

  const handleDiscard = () => {
    Alert.alert('Discard Changes', 'Are you sure you want to discard your changes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setLocalNotes(notes || '');
          setHasChanges(false);
        },
      },
    ]);
  };

  const templateSections = [
    {
      title: 'Chief Complaint',
      placeholder: 'Patient\'s primary reason for visit...',
    },
    {
      title: 'History of Present Illness',
      placeholder: 'Detailed description of symptoms, onset, duration, severity...',
    },
    {
      title: 'Physical Examination',
      placeholder: 'Vital signs, general appearance, system-specific findings...',
    },
    {
      title: 'Assessment',
      placeholder: 'Diagnosis, differential diagnoses, clinical reasoning...',
    },
    {
      title: 'Plan',
      placeholder: 'Treatment plan, medications, follow-up...',
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Clinical Notes',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditingNotes(!isEditingNotes)}>
              <Text className="text-primary-600 font-medium">
                {isEditingNotes ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Consultation Info */}
      <Card className="m-4 p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-primary-600">👤</Text>
            </View>
            <View>
              <Text className="font-semibold text-gray-900">
                {activeConsultation?.patientName || 'Patient'}
              </Text>
              <Text className="text-sm text-gray-500">
                {format(new Date(), 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
          </View>
          <Badge variant="success" size="md">In Progress</Badge>
        </View>
      </Card>

      {/* Notes Editor */}
      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">Notes</Text>
          <Badge variant="primary" size="sm">Auto-saved</Badge>
        </View>

        {isEditingNotes ? (
          <ScrollView
            className="flex-1 bg-white rounded-xl border border-gray-200 p-4"
            showsVerticalScrollIndicator={false}
          >
            {templateSections.map((section) => (
              <View key={section.title} className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  {section.title}
                </Text>
                <TextInput
                  placeholder={section.placeholder}
                  multiline
                  className="text-gray-900 leading-relaxed min-h-20"
                  value={localNotes}
                  onChangeText={(text) => {
                    setLocalNotes(text);
                    setNotes(text);
                  }}
                  textAlignVertical="top"
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1 bg-white rounded-xl border border-gray-200 p-4"
            showsVerticalScrollIndicator={false}
          >
            {notes ? (
              <Text className="text-gray-900 leading-relaxed">{notes}</Text>
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-400 text-lg mb-2">📝</Text>
                <Text className="text-gray-500 text-center">
                  No notes yet
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Tap Edit to add clinical notes
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Bottom Actions */}
      <View className="p-4 bg-white border-t border-gray-200">
        {isEditingNotes ? (
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={handleDiscard}
              className="flex-1 h-12"
            >
              <Text className="text-gray-700 font-semibold">Discard</Text>
            </Button>
            <Button
              onPress={handleSave}
              disabled={!hasChanges}
              className="flex-1 h-12"
            >
              <Text className="text-white font-semibold">Save Notes</Text>
            </Button>
          </View>
        ) : (
          <Button
            onPress={() => setIsEditingNotes(true)}
            className="h-12"
          >
            <Text className="text-white font-semibold">Edit Notes</Text>
          </Button>
        )}
      </View>
    </View>
  );
}
