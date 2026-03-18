"use client";

import { useEffect, useState } from "react";
import { VisitList } from "./VisitList";
import { VisitDetail } from "./VisitDetail";
import { useConsultationStore } from "@/shared/store/useConsultationStore";

interface ProfessionalDashboardProps {
  initialVisitId?: string | null;
}

export function ProfessionalDashboard({ initialVisitId }: ProfessionalDashboardProps) {
  const { visits, setVisits, selectedVisit, setSelectedVisit } = useConsultationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visits")
      .then((r) => r.json())
      .then((data) => {
        setVisits(Array.isArray(data) ? data : []);
      })
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  }, [setVisits]);

  useEffect(() => {
    if (initialVisitId && !selectedVisit) {
      fetch(`/api/visits/${initialVisitId}`)
        .then((r) => r.json())
        .then(setSelectedVisit)
        .catch(() => {});
    }
  }, [initialVisitId, selectedVisit, setSelectedVisit]);

  const handleSelectVisit = (id: string) => {
    fetch(`/api/visits/${id}`)
      .then((r) => r.json())
      .then(setSelectedVisit)
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-semibold text-lg">Escriba Médico</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline block mb-1">
            Nueva grabación
          </a>
          <a href="/api/auth/signout?callbackUrl=/login" className="text-sm text-gray-600 hover:underline">
            Cerrar sesión
          </a>
        </div>
        <VisitList
          visits={visits}
          selectedId={selectedVisit?.id}
          onSelect={handleSelectVisit}
          loading={loading}
        />
      </aside>
      <main className="flex-1 overflow-auto">
        {selectedVisit ? (
          <VisitDetail visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {loading ? "Cargando…" : "Seleccioná una consulta"}
          </div>
        )}
      </main>
    </div>
  );
}
