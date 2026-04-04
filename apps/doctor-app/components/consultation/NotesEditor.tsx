import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface NotesEditorProps {
  initialNotes?: string;
  onSave: (notes: string) => void;
  onCancel: () => void;
}

export function NotesEditor({ initialNotes = '', onSave, onCancel }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (text: string) => {
    setNotes(text);
    setHasChanges(text !== initialNotes);
  };

  const templateSections = [
    {
      title: 'Chief Complaint',
      placeholder: 'Patient\'s primary reason for visit...',
    },
    {
      title: 'History of Present Illness',
      placeholder: 'Detailed description of symptoms...',
    },
    {
      title: 'Physical Examination',
      placeholder: 'Vital signs, general appearance...',
    },
    {
      title: 'Assessment',
      placeholder: 'Diagnosis, differential diagnoses...',
    },
    {
      title: 'Plan',
      placeholder: 'Treatment plan, medications, follow-up...',
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={onCancel}>
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-gray-900">Edit Notes</Text>
          <TouchableOpacity
            onPress={() => onSave(notes)}
            disabled={!hasChanges}
          >
            <Text
              className={`font-medium ${
                hasChanges ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
      >
        {templateSections.map((section) => (
          <Card key={section.title} className="p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {section.title}
            </Text>
            <TextInput
              placeholder={section.placeholder}
              multiline
              value={notes}
              onChangeText={handleChange}
              className="text-gray-900 leading-relaxed min-h-24"
              textAlignVertical="top"
            />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
