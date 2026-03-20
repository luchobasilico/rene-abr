"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/shared/components/AppLayout";
import { ProfessionalDashboard } from "@/features/consultation/ProfessionalDashboard";
import type { MedicalActionsTabId } from "@/features/consultation/MedicalActionsPanel";

function parseActionsTab(value: string | null): MedicalActionsTabId | undefined {
  if (
    value === "recetas_ordenes" ||
    value === "resumen" ||
    value === "documentos" ||
    value === "analisis_ec" ||
    value === "analisis_clinico"
  ) {
    return value;
  }
  return undefined;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const onlyToday =
    searchParams.get("today") === "1" ||
    searchParams.get("today") === "true" ||
    searchParams.get("today") === "yes";
  const initialActionsTab = parseActionsTab(searchParams.get("open"));

  return (
    <ProfessionalDashboard
      initialVisitId={visitId}
      onlyToday={onlyToday}
      initialActionsTab={initialActionsTab}
    />
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="min-h-full flex items-center justify-center py-20">Cargando…</div>}>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  );
}
