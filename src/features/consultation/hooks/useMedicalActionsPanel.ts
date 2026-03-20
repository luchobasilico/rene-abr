"use client";

import { useEffect, useState } from "react";
import type { MedicalActionsTabId } from "@/features/consultation/MedicalActionsPanel";

export const MEDICAL_ACTIONS_TABS: Array<{ id: MedicalActionsTabId; label: string }> = [
  { id: "recetas_ordenes", label: "Recetas / Órdenes" },
  { id: "resumen", label: "Resumen del paciente" },
  { id: "documentos", label: "Documentos médicos" },
  { id: "analisis_ec", label: "Análisis de EC" },
  { id: "analisis_clinico", label: "Análisis clínico" },
];

interface UseMedicalActionsPanelOptions {
  initialTab?: MedicalActionsTabId;
}

export function useMedicalActionsPanel(options: UseMedicalActionsPanelOptions) {
  const [activeTab, setActiveTab] = useState<MedicalActionsTabId>(
    options.initialTab ?? "recetas_ordenes"
  );

  useEffect(() => {
    if (options.initialTab) setActiveTab(options.initialTab);
  }, [options.initialTab]);

  return {
    activeTab,
    setActiveTab,
    tabs: MEDICAL_ACTIONS_TABS,
  };
}
