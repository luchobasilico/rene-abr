"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { VisitDetail } from "./VisitDetail";
import type { MedicalActionsTabId } from "./MedicalActionsPanel";
import { useConsultationStore } from "@/shared/store/useConsultationStore";
import { useVisitDetailLoader } from "./hooks/useVisitDetailLoader";

interface ProfessionalDashboardProps {
  initialVisitId?: string | null;
  /** Solo listar consultas del día actual (zona horaria del navegador). */
  onlyToday?: boolean;
  initialActionsTab?: MedicalActionsTabId;
}

function isSameLocalCalendarDay(isoDate: string, reference: Date): boolean {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
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

export function ProfessionalDashboard({
  initialVisitId,
  onlyToday = false,
  initialActionsTab,
}: ProfessionalDashboardProps) {
  const { selectedVisit, setSelectedVisit, processing, clearProcessing } = useConsultationStore();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loading, setLoading] = useState(!!initialVisitId);
  /** En "Consultas de hoy": evita reabrir sola la 1.ª visita si el usuario cerró el detalle a propósito. */
  const skipAutoOpenVisitRef = useRef(false);
  const loadVisitDetail = useVisitDetailLoader(setLoading);

  const visitsInScope = useMemo(() => {
    if (!onlyToday) return visits;
    const ref = new Date();
    return visits.filter((v) => isSameLocalCalendarDay(v.createdAt, ref));
  }, [visits, onlyToday]);

  const patientsInScope = useMemo(() => {
    if (!onlyToday) return patients;
    const ids = new Set(visitsInScope.map((v) => v.patientId));
    return patients.filter((p) => ids.has(p.id));
  }, [patients, onlyToday, visitsInScope]);

  const filteredVisits = useMemo(
    () =>
      selectedPatientId
        ? visitsInScope.filter((v) => v.patientId === selectedPatientId)
        : [],
    [selectedPatientId, visitsInScope]
  );
  const showBrowsePanel = !initialVisitId;

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
        if (onlyToday) {
          const ref = new Date();
          const todayVisits = visitsData.filter((v) => isSameLocalCalendarDay(v.createdAt, ref));
          const withVisitToday = new Set(todayVisits.map((v) => v.patientId));
          const first = patientsData.find((p) => withVisitToday.has(p.id));
          setSelectedPatientId(first?.id ?? null);
        } else {
          setSelectedPatientId((prev) => prev ?? visitsData[0]?.patientId ?? patientsData[0]?.id ?? null);
        }
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    };

    void loadLists();
    return () => {
      cancelled = true;
    };
  }, [onlyToday]);

  useEffect(() => {
    if (initialVisitId && !selectedVisit) {
      void loadVisitDetail(initialVisitId);
    } else if (!initialVisitId) {
      setLoading(false);
    }
  }, [initialVisitId, loadVisitDetail, selectedVisit]);

  useEffect(() => {
    if (!selectedVisit) return;
    if (selectedPatientId && selectedVisit.patient.id !== selectedPatientId) {
      setSelectedVisit(null);
    }
  }, [selectedPatientId, selectedVisit, setSelectedVisit]);

  /** Si el modo es solo hoy, no dejar abierta una consulta de otro día. */
  useEffect(() => {
    if (!onlyToday || !selectedVisit || loadingLists) return;
    const allowed = new Set(visitsInScope.map((v) => v.id));
    if (!allowed.has(selectedVisit.id)) {
      setSelectedVisit(null);
    }
  }, [onlyToday, selectedVisit, visitsInScope, loadingLists, setSelectedVisit]);

  /** En modo "hoy": abrir la última consulta del paciente al elegirlo (si aún no hay detalle). */
  useEffect(() => {
    if (!onlyToday || loadingLists || !selectedPatientId || initialVisitId) return;
    if (skipAutoOpenVisitRef.current) return;

    const list = visitsInScope.filter((v) => v.patientId === selectedPatientId);
    if (list.length === 0) return;

    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecent = sorted[0];
    const current = useConsultationStore.getState().selectedVisit;

    if (current?.id === mostRecent.id) return;
    if (current?.patient.id === selectedPatientId) return;

    void loadVisitDetail(mostRecent.id);
  }, [onlyToday, loadingLists, selectedPatientId, visitsInScope, initialVisitId, loadVisitDetail]);

  return (
    <div className="min-h-full flex" style={{ backgroundColor: "#f0fdfa" }}>
      {showBrowsePanel && (
      <aside className="w-80 border-r border-rene-aquaDark/60 bg-white/70 flex flex-col">
        <div className="p-3 border-b border-rene-aquaDark/60">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            {onlyToday ? "Pacientes (con consulta hoy)" : "Pacientes"}
          </p>
          <div className="mt-2 max-h-52 overflow-auto space-y-1">
            {loadingLists ? (
              <p className="text-sm text-gray-500 p-2">Cargando pacientes…</p>
            ) : patientsInScope.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">
                {onlyToday ? "Ningún paciente con consulta hoy." : "Sin pacientes"}
              </p>
            ) : (
              patientsInScope.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    skipAutoOpenVisitRef.current = false;
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
            {onlyToday ? "Consultas de hoy" : "Consultas"}
          </p>
          <div className="mt-2 flex-1 overflow-auto space-y-1">
            {!selectedPatientId ? (
              <p className="text-sm text-gray-500 p-2">
                {onlyToday && patientsInScope.length === 0 && !loadingLists
                  ? "No hay consultas registradas hoy."
                  : "Seleccioná un paciente"}
              </p>
            ) : filteredVisits.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">
                {onlyToday ? "Sin consultas hoy para este paciente." : "Sin consultas para este paciente"}
              </p>
            ) : (
              filteredVisits
                .slice()
                .sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .map((visit) => (
                <button
                  key={visit.id}
                  type="button"
                  onClick={() => {
                    skipAutoOpenVisitRef.current = false;
                    void loadVisitDetail(visit.id);
                  }}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    selectedVisit?.id === visit.id
                      ? "border-rene-green bg-rene-aqua/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800 block">
                    {onlyToday
                      ? new Date(visit.createdAt).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : new Date(visit.createdAt).toLocaleDateString("es-AR")}
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
          <VisitDetail
            visit={selectedVisit}
            initialActionsTab={initialActionsTab}
            onClose={() => {
              if (onlyToday) skipAutoOpenVisitRef.current = true;
              setSelectedVisit(null);
            }}
          />
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
