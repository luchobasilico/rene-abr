"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProfessionalDashboard } from "@/features/consultation/ProfessionalDashboard";

function DashboardContent() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");

  return <ProfessionalDashboard initialVisitId={visitId} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
