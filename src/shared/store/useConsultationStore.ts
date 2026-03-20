import { create } from "zustand";

interface VisitSummary {
  id: string;
  patientName: string;
  createdAt: string;
  signedAt?: string;
}

interface VisitDetail {
  id: string;
  patient: { id: string; name: string };
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
  currentTime: number;
  selectedSegmentId: string | null;
  highlightedNoteBlock: string | null;
  setVisits: (v: VisitSummary[]) => void;
  setSelectedVisit: (v: VisitDetail | null) => void;
  setProcessing: (p: ConsultationState["processing"]) => void;
  clearProcessing: () => void;
  setCurrentTime: (t: number) => void;
  setSelectedSegment: (id: string | null) => void;
  setHighlightedNoteBlock: (block: string | null) => void;
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  visits: [],
  selectedVisit: null,
  processing: { active: false, stage: "idle" },
  currentTime: 0,
  selectedSegmentId: null,
  highlightedNoteBlock: null,
  setVisits: (visits) => set({ visits }),
  setSelectedVisit: (selectedVisit) => set({ selectedVisit }),
  setProcessing: (processing) => set({ processing }),
  clearProcessing: () => set({ processing: { active: false, stage: "idle" } }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setSelectedSegment: (selectedSegmentId) => set({ selectedSegmentId }),
  setHighlightedNoteBlock: (highlightedNoteBlock) => set({ highlightedNoteBlock }),
}));
