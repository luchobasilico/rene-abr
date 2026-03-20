"use client";

import { useMemo, useState } from "react";

export type NotesLeftTabId = "nota" | "transcripcion" | "evidencia" | "lectura_estudios";

export const NOTES_LEFT_TABS: Array<{ id: NotesLeftTabId; label: string }> = [
  { id: "nota", label: "Nota clínica" },
  { id: "transcripcion", label: "Transcripción de la consulta" },
  { id: "evidencia", label: "Evidencia enlazada" },
  { id: "lectura_estudios", label: "Lectura de estudios" },
];

interface SOAPNoteLike {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ExtractedStudyLike {
  type: string;
  description: string;
}

interface UseNotesLeftPanelOptions {
  soap: SOAPNoteLike;
  transcript?: {
    segments: Array<{
      speaker: string;
      timestampStart: number;
      timestampEnd: number;
      text: string;
    }>;
  } | null;
  extractedStudies?: ExtractedStudyLike[];
}

export function useNotesLeftPanel({
  soap,
  transcript,
  extractedStudies = [],
}: UseNotesLeftPanelOptions) {
  const [activeTab, setActiveTab] = useState<NotesLeftTabId>("nota");

  const hasTranscript = !!(transcript?.segments && transcript.segments.length > 0);
  const canShowEvidence = hasTranscript && Object.values(soap).some((v) => v?.trim());
  const hasMedicalOrders = extractedStudies.length > 0;

  const studiesWithTypeLabel = useMemo(
    () =>
      extractedStudies.map((order, index) => ({
        ...order,
        key: `${order.type}-${index}`,
        typeLabel:
          order.type === "lab"
            ? "Laboratorio"
            : order.type === "imaging"
              ? "Imagenología"
              : "Derivación",
      })),
    [extractedStudies]
  );

  return {
    tabs: NOTES_LEFT_TABS,
    activeTab,
    setActiveTab,
    hasTranscript,
    canShowEvidence,
    hasMedicalOrders,
    studiesWithTypeLabel,
  };
}
