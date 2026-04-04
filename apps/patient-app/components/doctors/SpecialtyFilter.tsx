import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stethoscope, Heart, Brain, Eye, Bone, Smile, Kidney, Lungs, Tooth } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import type { Specialty } from '@/lib/types';

const iconMap: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope size={20} color="#4F46E5" />,
  heart: <Heart size={20} color="#EF4444" />,
  brain: <Brain size={20} color="#8B5CF6" />,
  eye: <Eye size={20} color="#10B981" />,
  bone: <Bone size={20} color="#F59E0B" />,
  child: <Smile size={20} color="#EC4899" />,
  smile: <Smile size={20} color="#EC4899" />,
  kidney: <Kidney size={20} color="#EF4444" />,
  lungs: <Lungs size={20} color="#06B6D4" />,
  tooth: <Tooth size={20} color="#3B82F6" />,
};

interface SpecialtyFilterProps {
  specialties: Specialty[];
  selectedSpecialty?: string;
  onSelectSpecialty: (specialtyId: string | undefined) => void;
  className?: string;
}

export function SpecialtyFilter({
  specialties,
  selectedSpecialty,
  onSelectSpecialty,
  className,
}: SpecialtyFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 gap-3"
      className={cn('', className)}
    >
      <TouchableOpacity
        onPress={() => onSelectSpecialty(undefined)}
        className={cn(
          'px-4 py-2 rounded-full border',
          !selectedSpecialty
            ? 'bg-primary-600 border-primary-600'
            : 'bg-white border-gray-200'
        )}
      >
        <Text
          className={cn(
            'text-sm font-medium',
            !selectedSpecialty ? 'text-white' : 'text-gray-700'
          )}
        >
          All
        </Text>
      </TouchableOpacity>
      {specialties.map((specialty) => {
        const isSelected = selectedSpecialty === specialty.id;
        return (
          <TouchableOpacity
            key={specialty.id}
            onPress={() => onSelectSpecialty(specialty.id)}
            className={cn(
              'flex-row items-center gap-2 px-4 py-2 rounded-full border',
              isSelected
                ? 'bg-primary-50 border-primary-600'
                : 'bg-white border-gray-200'
            )}
          >
            {iconMap[specialty.icon] || <Stethoscope size={20} color="#4F46E5" />}
            <Text
              className={cn(
                'text-sm font-medium',
                isSelected ? 'text-primary-700' : 'text-gray-700'
              )}
            >
              {specialty.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
