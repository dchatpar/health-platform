import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'prescription' | 'lab' | 'radiology';
  condition?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  status?: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
  };
}

interface PatientDetails {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
  };
  medicalHistory: MedicalRecord[];
}

export function usePatients() {
  // Fetch patient by ID
  const getPatientById = useCallback(
    async (patientId: string): Promise<PatientDetails | null> => {
      try {
        const response = await api.get(`/patients/${patientId}`);
        return response.data as PatientDetails;
      } catch (error) {
        console.error('Error fetching patient:', error);
        return null;
      }
    },
    []
  );

  // Fetch patient history
  const getPatientHistory = useCallback(
    async (patientId: string): Promise<MedicalRecord[]> => {
      try {
        const response = await api.get(`/patients/${patientId}/history`);
        return response.data as MedicalRecord[];
      } catch (error) {
        console.error('Error fetching patient history:', error);
        return [];
      }
    },
    []
  );

  // Fetch patient medications
  const getPatientMedications = useCallback(
    async (patientId: string) => {
      try {
        const response = await api.get(`/patients/${patientId}/medications`);
        return response.data;
      } catch (error) {
        console.error('Error fetching medications:', error);
        return [];
      }
    },
    []
  );

  // Fetch patient allergies
  const getPatientAllergies = useCallback(async (patientId: string) => {
    try {
      const response = await api.get(`/patients/${patientId}/allergies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching allergies:', error);
      return [];
    }
  }, []);

  // Use query hook for patient details
  const usePatient = (patientId: string) => {
    return useQuery({
      queryKey: ['patient', patientId],
      queryFn: () => getPatientById(patientId),
      enabled: !!patientId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Use query hook for patient history
  const usePatientHistory = (patientId: string) => {
    return useQuery({
      queryKey: ['patient-history', patientId],
      queryFn: () => getPatientHistory(patientId),
      enabled: !!patientId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  return {
    getPatientById,
    getPatientHistory,
    getPatientMedications,
    getPatientAllergies,
    usePatient,
    usePatientHistory,
  };
}
