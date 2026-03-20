"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { VisitDetail } from "./VisitDetail";
import { useConsultationStore } from "@/shared/store/useConsultationStore";
import { mergeVisitDetailForProcessing } from "@/lib/mergeVisitDetailForProcessing";

interface ProfessionalDashboardProps {
  initialVisitId?: string | null;
}

interface PatientItem {
  id: string;
  name: string;
  document?: string | null;
}

interface VisitItem {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  signedAt?: string;
}

export function ProfessionalDashboard({ initialVisitId }: ProfessionalDashboardProps) {
  const { selectedVisit, setSelectedVisit, processing, clearProcessing } = useConsultationStore();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loading, setLoading] = useState(!!initialVisitId);

  const filteredVisits = useMemo(
    () =>
      selectedPatientId
        ? visits.filter((v) => v.patientId === selectedPatientId)
        : [],
    [selectedPatientId, visits]
  );
  const showBrowsePanel = !initialVisitId;

  const loadVisitDetail = async (visitId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/visits/${visitId}`);
      const detail = await response.json();
      const store = useConsultationStore.getState();
      const merged = mergeVisitDetailForProcessing(
        detail,
        store.selectedVisit,
        store.processing.active
      );
      setSelectedVisit(merged);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadLists = async () => {
      setLoadingLists(true);
      try {
        const [patientsRes, visitsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/visits"),
        ]);
        if (!patientsRes.ok || !visitsRes.ok) return;
        const [patientsData, visitsData] = (await Promise.all([
          patientsRes.json(),
          visitsRes.json(),
        ])) as [PatientItem[], VisitItem[]];
        if (cancelled) return;
        setPatients(patientsData);
        setVisits(visitsData);
        setSelectedPatientId((prev) => prev ?? visitsData[0]?.patientId ?? patientsData[0]?.id ?? null);
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    };

    void loadLists();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (initialVisitId && !selectedVisit) {
      void loadVisitDetail(initialVisitId);
    } else if (!initialVisitId) {
      setLoading(false);
    }
  }, [initialVisitId, selectedVisit]);

  useEffect(() => {
    if (!selectedVisit) return;
    if (selectedPatientId && selectedVisit.patient.id !== selectedPatientId) {
      setSelectedVisit(null);
    }
  }, [selectedPatientId, selectedVisit, setSelectedVisit]);

  return (
    <div className="min-h-full flex" style={{ backgroundColor: "#f0fdfa" }}>
      {showBrowsePanel && (
      <aside className="w-80 border-r border-rene-aquaDark/60 bg-white/70 flex flex-col">
        <div className="p-3 border-b border-rene-aquaDark/60">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            Pacientes
          </p>
          <div className="mt-2 max-h-52 overflow-auto space-y-1">
            {loadingLists ? (
              <p className="text-sm text-gray-500 p-2">Cargando pacientes…</p>
            ) : patients.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">Sin pacientes</p>
            ) : (
              patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setSelectedVisit(null);
                  }}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    selectedPatientId === patient.id
                      ? "border-rene-green bg-rene-aqua/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800 block">{patient.name}</span>
                  {patient.document ? (
                    <span className="text-xs text-gray-500">DNI: {patient.document}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-3 flex-1 min-h-0 flex flex-col">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            Consultas
          </p>
          <div className="mt-2 flex-1 overflow-auto space-y-1">
            {!selectedPatientId ? (
              <p className="text-sm text-gray-500 p-2">Seleccioná un paciente</p>
            ) : filteredVisits.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">Sin consultas para este paciente</p>
            ) : (
              filteredVisits.map((visit) => (
                <button
                  key={visit.id}
                  type="button"
                  onClick={() => void loadVisitDetail(visit.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    selectedVisit?.id === visit.id
                      ? "border-rene-green bg-rene-aqua/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800 block">
                    {new Date(visit.createdAt).toLocaleDateString("es-AR")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {visit.signedAt ? "Firmada" : "Sin firmar"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
      )}

      <main className="flex-1 overflow-auto min-w-0">
        {selectedVisit ? (
          <VisitDetail visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
        ) : processing.active ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-gray-600 gap-4 px-6">
            <div className="w-full max-w-xl rounded-2xl border border-rene-aquaDark bg-white/80 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800">Procesando consulta</h3>
              {processing.patientLabel ? (
                <p className="text-sm text-gray-500 mt-1">{processing.patientLabel}</p>
              ) : null}
              <p className="mt-4 text-base text-gray-700">{processing.message ?? "Procesando..."}</p>
              <div className="mt-5 h-2 w-full rounded-full bg-rene-aquaDark/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    processing.stage === "uploading"
                      ? "w-1/4 bg-rene-green"
                      : processing.stage === "transcribing"
                        ? "w-2/4 bg-rene-green"
                        : processing.stage === "generating"
                          ? "w-3/4 bg-rene-greenDark"
                          : processing.stage === "finalizing"
                            ? "w-full bg-rene-greenDark"
                            : "w-full bg-red-400"
                  }`}
                />
              </div>
              {processing.stage === "error" ? (
                <button
                  type="button"
                  onClick={clearProcessing}
                  className="mt-4 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  Cerrar mensaje
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-gray-500 gap-4">
            {loading ? (
              <p>Cargando…</p>
            ) : (
              <>
                <p>No hay consulta seleccionada.</p>
                <Link href="/" className="text-rene-green hover:underline font-medium">
                  Ir a nueva grabación
                </Link>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
