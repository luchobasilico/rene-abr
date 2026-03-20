"use client";

import { useCallback } from "react";
import { useConsultationStore } from "@/shared/store/useConsultationStore";
import { mergeVisitDetailForProcessing } from "@/lib/mergeVisitDetailForProcessing";
import { normalizeVisitDetail } from "@/features/consultation/adapters/visitAdapters";

/**
 * Carga y normaliza el detalle de visita usando un flujo único
 * para evitar duplicación entre dashboard y recorder.
 */
export function useVisitDetailLoader(onLoadingChange?: (loading: boolean) => void) {
  const setSelectedVisit = useConsultationStore((s) => s.setSelectedVisit);

  return useCallback(
    async (visitId: string) => {
      onLoadingChange?.(true);
      try {
        const response = await fetch(`/api/visits/${visitId}`);
        if (!response.ok) return;
        const detail = normalizeVisitDetail(await response.json());
        const store = useConsultationStore.getState();
        const merged = mergeVisitDetailForProcessing(
          detail,
          store.selectedVisit,
          store.processing.active
        );
        setSelectedVisit(merged);
      } catch {
        // ignore loader errors in UI flow
      } finally {
        onLoadingChange?.(false);
      }
    },
    [onLoadingChange, setSelectedVisit]
  );
}
