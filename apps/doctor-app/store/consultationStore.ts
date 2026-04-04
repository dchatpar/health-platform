import { create } from 'zustand';

interface ConsultationState {
  activeConsultationId: string | null;
  activePatientName: string | null;
  notes: string;
  isEditingNotes: boolean;
  isPrescribing: boolean;
  isOrderingTests: boolean;
  // Actions
  setActiveConsultation: (id: string, patientName: string) => void;
  endConsultation: () => void;
  setNotes: (notes: string) => void;
  setIsEditingNotes: (editing: boolean) => void;
  setIsPrescribing: (prescribing: boolean) => void;
  setIsOrderingTests: (ordering: boolean) => void;
  clearNotes: () => void;
}

export const consultationStore = create<ConsultationState>()((set) => ({
  activeConsultationId: null,
  activePatientName: null,
  notes: '',
  isEditingNotes: false,
  isPrescribing: false,
  isOrderingTests: false,

  setActiveConsultation: (id, patientName) => {
    set({
      activeConsultationId: id,
      activePatientName: patientName,
      notes: '',
      isEditingNotes: false,
      isPrescribing: false,
      isOrderingTests: false,
    });
  },

  endConsultation: () => {
    set({
      activeConsultationId: null,
      activePatientName: null,
      notes: '',
      isEditingNotes: false,
      isPrescribing: false,
      isOrderingTests: false,
    });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  setIsEditingNotes: (editing) => {
    set({ isEditingNotes: editing });
  },

  setIsPrescribing: (prescribing) => {
    set({ isPrescribing: prescribing });
  },

  setIsOrderingTests: (ordering) => {
    set({ isOrderingTests: ordering });
  },

  clearNotes: () => {
    set({ notes: '' });
  },
}));
