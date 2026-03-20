import { create } from "zustand";

interface VisitSummary {
  id: string;
  patientName: string;
  createdAt: string;
  signedAt?: string;
}

/** Paciente en detalle de visita (el API puede devolver todos los campos). */
export interface VisitPatient {
  id: string;
  name: string;
  birthDate?: string | null;
  document?: string | null;
  sex?: string | null;
  coverage?: string | null;
  affiliateNumber?: string | null;
  plan?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

interface VisitDetail {
  id: string;
  patient: VisitPatient;
  soap: { subjective: string; objective: string; assessment: string; plan: string } | null;
  transcript: { segments: Array<{ speaker: string; timestampStart: number; timestampEnd: number; text: string }> } | null;
  prescriptions: Array<{ drug: string; dose: string; frequency: string; route: string; duration: string }>;
  medicalOrders: Array<{ type: string; description: string }>;
  patientSummary: string | null;
  signedAt?: string;
}

interface ConsultationState {
  visits: VisitSummary[];
  selectedVisit: VisitDetail | null;
  processing: {
    active: boolean;
    stage: "idle" | "uploading" | "transcribing" | "generating" | "finalizing" | "error";
    message?: string;
    patientLabel?: string;
  };
  setVisits: (v: VisitSummary[]) => void;
  setSelectedVisit: (v: VisitDetail | null) => void;
  setProcessing: (p: ConsultationState["processing"]) => void;
  clearProcessing: () => void;
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  visits: [],
  selectedVisit: null,
  processing: { active: false, stage: "idle" },
  setVisits: (visits) => set({ visits }),
  setSelectedVisit: (selectedVisit) => set({ selectedVisit }),
  setProcessing: (processing) => set({ processing }),
  clearProcessing: () => set({ processing: { active: false, stage: "idle" } }),
}));
