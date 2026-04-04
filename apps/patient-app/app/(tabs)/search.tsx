import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, Filter, X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DoctorList } from '@/components/doctors/DoctorList';
import { SpecialtyFilter } from '@/components/doctors/SpecialtyFilter';
import { Header } from '@/components/common/Header';
import { SPECIALTIES } from '@/lib/constants';
import type { Doctor } from '@/lib/types';

// Mock data for doctors
const mockDoctors: Doctor[] = [
  {
    id: '1',
    userId: 'u1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@example.com',
    phone: '+1234567890',
    specialty: { id: '1', name: 'Cardiologist', icon: 'heart' },
    qualifications: [{ id: 'q1', degree: 'MD', institution: 'Harvard', year: 2010 }],
    yearsOfExperience: 15,
    bio: 'Expert in cardiovascular health',
    rating: 4.8,
    reviewCount: 124,
    consultationFee: 150,
    availableForTeleconsultation: true,
    availableForHomeVisit: false,
    languages: ['English', 'Spanish'],
    clinic: {
      id: 'c1',
      name: 'Heart Care Center',
      address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
      phone: '+1234567890',
      coordinates: { latitude: 40.7128, longitude: -74.006 },
    },
    workingHours: [],
    createdAt: '2020-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    userId: 'u2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael@example.com',
    phone: '+1234567891',
    specialty: { id: '2', name: 'General Physician', icon: 'stethoscope' },
    qualifications: [{ id: 'q2', degree: 'MD', institution: 'Stanford', year: 2015 }],
    yearsOfExperience: 10,
    bio: 'Family medicine specialist',
    rating: 4.9,
    reviewCount: 89,
    consultationFee: 100,
    availableForTeleconsultation: true,
    availableForHomeVisit: true,
    languages: ['English', 'Mandarin'],
    clinic: {
      id: 'c2',
      name: 'Family Health Clinic',
      address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'USA' },
      phone: '+1234567891',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
    },
    workingHours: [],
    createdAt: '2020-01-01',
    updatedAt: '2024-01-01',
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      searchQuery === '' ||
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      !selectedSpecialty || doctor.specialty.id === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorPress = (doctor: Doctor) => {
    router.push(`/doctors/${doctor.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Header
        title="Find Doctors"
        subtitle={`${filteredDoctors.length} doctors available`}
      />

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              placeholder="Search doctors, specialties..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<SearchIcon size={20} color="#6B7280" />}
              rightIcon={
                searchQuery ? (
                  <X
                    size={20}
                    color="#6B7280"
                    onPress={() => setSearchQuery('')}
                  />
                ) : undefined
              }
              containerClassName="mb-0"
            />
          </View>
          <Button
            title=""
            onPress={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'outline'}
            className="w-12 h-12 p-0"
          >
            <Filter size={20} color={showFilters ? '#FFFFFF' : '#4F46E5'} />
          </Button>
        </View>
      </View>

      {/* Specialty Filter */}
      <View className="py-3 bg-white">
        <SpecialtyFilter
          specialties={SPECIALTIES}
          selectedSpecialty={selectedSpecialty}
          onSelectSpecialty={setSelectedSpecialty}
        />
      </View>

      {/* Results */}
      <DoctorList
        doctors={filteredDoctors}
        onDoctorPress={handleDoctorPress}
        ListHeaderComponent={
          searchQuery || selectedSpecialty ? (
            <Text className="text-sm text-gray-500 px-4 pb-2">
              {filteredDoctors.length} result{filteredDoctors.length !== 1 ? 's' : ''}
              {searchQuery ? ` for "${searchQuery}"` : ''}
            </Text>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
