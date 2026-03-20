import { create } from "zustand";
import type { VisitDetail, VisitSummary } from "@shared-types";

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
