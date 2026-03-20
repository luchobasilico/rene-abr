"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/shared/components/AppLayout";
import { ProfessionalDashboard } from "@/features/consultation/ProfessionalDashboard";

function DashboardContent() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const onlyToday =
    searchParams.get("today") === "1" ||
    searchParams.get("today") === "true" ||
    searchParams.get("today") === "yes";

  return <ProfessionalDashboard initialVisitId={visitId} onlyToday={onlyToday} />;
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
