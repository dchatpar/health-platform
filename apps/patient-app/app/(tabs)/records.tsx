import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Lab,
  Imaging,
  Pill,
  Calendar,
  Download,
  Share,
  ChevronRight,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/common/Header';
import { EmptyView } from '@/components/common/Empty';
import { cn } from '@/lib/utils';

const records = [
  {
    id: '1',
    type: 'lab_result',
    title: 'Complete Blood Count (CBC)',
    description: 'Routine blood test',
    date: '2024-03-28',
    doctor: 'Dr. Michael Chen',
    fileUrl: undefined,
  },
  {
    id: '2',
    type: 'imaging',
    title: 'Chest X-Ray',
    description: 'Annual checkup chest x-ray',
    date: '2024-03-15',
    doctor: 'Dr. Sarah Johnson',
    fileUrl: undefined,
  },
  {
    id: '3',
    type: 'prescription',
    title: 'Blood Pressure Medication',
    description: 'Prescription for Amlodipine 5mg',
    date: '2024-03-10',
    doctor: 'Dr. Sarah Johnson',
    fileUrl: undefined,
  },
  {
    id: '4',
    type: 'diagnosis',
    title: 'Annual Health Checkup',
    description: 'Routine annual examination results',
    date: '2024-03-01',
    doctor: 'Dr. Michael Chen',
    fileUrl: undefined,
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  lab_result: <Lab size={20} color="#4F46E5" />,
  imaging: <Imaging size={20} color="#8B5CF6" />,
  prescription: <Pill size={20} color="#10B981" />,
  diagnosis: <FileText size={20} color="#F59E0B" />,
};

const typeColors: Record<string, string> = {
  lab_result: 'bg-primary-100',
  imaging: 'bg-secondary-100',
  prescription: 'bg-success-100',
  diagnosis: 'bg-warning-100',
};

const typeLabels: Record<string, string> = {
  lab_result: 'Lab Result',
  imaging: 'Imaging',
  prescription: 'Prescription',
  diagnosis: 'Diagnosis',
};

type FilterType = 'all' | 'lab_result' | 'imaging' | 'prescription' | 'diagnosis';

export default function RecordsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredRecords = records.filter((record) => {
    return filter === 'all' || record.type === filter;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Medical Records"
        rightAction={
          <Button
            title=""
            onPress={() => {}}
            variant="ghost"
            className="w-10 h-10 p-0"
          >
            <Share size={20} color="#4F46E5" />
          </Button>
        }
      />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-3 gap-2 bg-white border-b border-gray-100"
      >
        {(['all', 'lab_result', 'imaging', 'prescription', 'diagnosis'] as FilterType[]).map(
          (f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-full',
                filter === f ? 'bg-primary-600' : 'bg-gray-100'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium capitalize',
                  filter === f ? 'text-white' : 'text-gray-700'
                )}
              >
                {f === 'all' ? 'All' : typeLabels[f]}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-4 gap-3">
            {filteredRecords.map((record) => (
              <Card key={record.id} onPress={() => {}}>
                <View className="flex-row gap-3">
                  <View
                    className={cn(
                      'w-12 h-12 rounded-xl items-center justify-center',
                      typeColors[record.type]
                    )}
                  >
                    {typeIcons[record.type]}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {record.title}
                      </Text>
                      <Badge variant="default" size="sm">
                        {typeLabels[record.type]}
                      </Badge>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">
                      {record.description}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Calendar size={12} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        {record.doctor}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="mt-3 pt-3 border-t border-gray-100 flex-row gap-2">
                  <Button
                    title="View"
                    variant="outline"
                    size="sm"
                    onPress={() => {}}
                    className="flex-1"
                  />
                  <Button
                    title=""
                    variant="ghost"
                    size="sm"
                    onPress={() => {}}
                    className="w-10 h-10 p-0"
                  >
                    <Download size={18} color="#4F46E5" />
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      ) : (
        <EmptyView
          title="No records found"
          description="Your medical records will appear here"
        />
      )}
    </SafeAreaView>
  );
}
