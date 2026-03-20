"use client";

import { useState } from "react";
import { EstudiosOrdenesSection } from "./EstudiosOrdenesSection";
import { MedicalDocumentsSection } from "./MedicalDocumentsSection";

type TabId = "recetas_ordenes" | "resumen" | "documentos";

interface MedicalActionsPanelProps {
  prescriptions: Array<{ drug: string; dose: string; frequency: string; route: string; duration: string }>;
  medicalOrders: Array<{ type: string; description: string }>;
  patientSummary: string | null;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "recetas_ordenes", label: "Recetas / Órdenes" },
  { id: "resumen", label: "Resumen del paciente" },
  { id: "documentos", label: "Documentos médicos" },
];

export function MedicalActionsPanel({
  prescriptions,
  medicalOrders,
  patientSummary,
}: MedicalActionsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("recetas_ordenes");

  return (
    <div className="bg-white border border-rene-aquaDark/40 rounded-lg overflow-hidden flex flex-col">
      <div className="flex flex-wrap gap-x-1 border-b border-rene-aquaDark/40 shrink-0">
        {TABS.map(({ id, label }) => (
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
            prescriptions={prescriptions}
            medicalOrders={medicalOrders}
          />
        )}
        {activeTab === "resumen" && (
          <div className="text-sm whitespace-pre-wrap">
            {patientSummary || <p className="text-gray-500">Sin resumen.</p>}
          </div>
        )}
        {activeTab === "documentos" && <MedicalDocumentsSection />}
      </div>
    </div>
  );
}
