"use client";

import { EstudiosOrdenesSection } from "./EstudiosOrdenesSection";
import { MedicalDocumentsSection } from "./MedicalDocumentsSection";
import { useMedicalActionsPanel } from "./hooks/useMedicalActionsPanel";
import { StudiesAnalysisSection } from "./StudiesAnalysisSection";

export type MedicalActionsTabId =
  | "recetas_ordenes"
  | "resumen"
  | "documentos"
  | "analisis_ec"
  | "analisis_clinico";

interface MedicalActionsPanelProps {
  extractedActions: {
    medications: Array<{ drug: string; dose: string; frequency: string; route: string; duration: string }>;
    studies: Array<{ type: string; description: string }>;
  };
  patientSummary: string | null;
  initialTab?: MedicalActionsTabId;
}

export function MedicalActionsPanel({
  extractedActions,
  patientSummary,
  initialTab,
}: MedicalActionsPanelProps) {
  const { activeTab, setActiveTab, tabs } = useMedicalActionsPanel({ initialTab });

  return (
    <div className="bg-white border border-rene-aquaDark/40 rounded-lg overflow-hidden flex flex-col">
      <div className="flex flex-wrap gap-x-1 border-b border-rene-aquaDark/40 shrink-0">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center justify-center min-h-11 h-11 px-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition box-border ${
              activeTab === id
                ? "border-rene-green text-rene-green"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === "recetas_ordenes" && (
          <EstudiosOrdenesSection
            prescriptions={extractedActions.medications}
            medicalOrders={extractedActions.studies}
          />
        )}
        {activeTab === "resumen" && (
          <div className="text-sm whitespace-pre-wrap">
            {patientSummary || <p className="text-gray-500">Sin resumen.</p>}
          </div>
        )}
        {activeTab === "documentos" && <MedicalDocumentsSection />}
        {activeTab === "analisis_ec" && (
          <StudiesAnalysisSection studies={extractedActions.studies} />
        )}
        {activeTab === "analisis_clinico" && (
          <div className="text-sm text-gray-700 space-y-2">
            <p className="font-medium text-rene-greenDark">Análisis clínico</p>
            <p>
              Backlog `UI-002`: interpretación clínica consolidada, alertas y hallazgos relevantes
              para apoyo a la decisión médica.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
