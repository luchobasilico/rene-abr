"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/shared/components/AppLayout";

interface AgentConfigResponse {
  success: boolean;
  config?: {
    mode: "deterministic";
    soap: { timeoutMs: number; retries: number };
    medication: { timeoutMs: number; retries: number };
    studies: { timeoutMs: number; retries: number };
    documents: { timeoutMs: number; retries: number };
    followups: { timeoutMs: number; retries: number };
  };
}

interface AgentAuditRow {
  id: string;
  createdAt: string;
  visitId: string;
  patientId: string;
  patientName: string;
  visitCreatedAt: string;
  agentKey: string;
  activated: boolean;
  reason: string;
  matchedPattern?: string;
  source: string;
}

interface AgentAuditResponse {
  success: boolean;
  rows?: AgentAuditRow[];
}

export default function OpsSystemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AgentConfigResponse["config"]>();
  const [rows, setRows] = useState<AgentAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(searchParams.get("agent") ?? "all");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") ?? "all");
  const [fromDate, setFromDate] = useState(searchParams.get("from") ?? "");
  const [toDate, setToDate] = useState(searchParams.get("to") ?? "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAgent !== "all") params.set("agent", selectedAgent);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const query = params.toString();
    router.replace(query ? `/ops/system?${query}` : "/ops/system");
  }, [fromDate, router, selectedAgent, selectedStatus, toDate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "120" });
        if (selectedAgent !== "all") params.set("agent", selectedAgent);
        if (selectedStatus === "activated") params.set("activated", "true");
        if (selectedStatus === "not_activated") params.set("activated", "false");
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);

        const [configRes, rowsRes] = await Promise.all([
          fetch("/api/agent-config"),
          fetch(`/api/ops/agent-audit?${params.toString()}`),
        ]);
        const configData = (await configRes.json()) as AgentConfigResponse;
        const rowsData = (await rowsRes.json()) as AgentAuditResponse;
        if (cancelled) return;
        setConfig(configData.config);
        setRows(rowsData.rows ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [fromDate, selectedAgent, selectedStatus, toDate]);

  const stats = useMemo(() => {
    const total = rows.length;
    const activated = rows.filter((r) => r.activated).length;
    const notActivated = total - activated;
    return { total, activated, notActivated };
  }, [rows]);

  return (
    <AppLayout>
      <div className="min-h-full p-4 md:p-6 bg-rene-aqua/30">
        <div className="max-w-6xl mx-auto space-y-4">
          <header className="rounded-xl border border-rene-aquaDark/40 bg-white p-4">
            <h1 className="text-xl font-semibold text-gray-900">Ops · Estado del sistema IA</h1>
            <p className="text-sm text-gray-600 mt-1">
              Panel interno de trazabilidad técnica (no visible en flujo clínico del médico).
            </p>
          </header>

          {loading ? (
            <p className="text-sm text-gray-600">Cargando estado interno...</p>
          ) : (
            <>
              <section className="rounded-xl border border-rene-aquaDark/40 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Configuración activa</h2>
                {config ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div className="rounded-md border border-gray-200 p-2">
                      <p className="text-gray-500">Modo</p>
                      <p className="font-medium text-gray-900">{config.mode}</p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-2">
                      <p className="text-gray-500">SOAP</p>
                      <p className="font-medium text-gray-900">
                        {config.soap.timeoutMs}ms · {config.soap.retries} retry
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-2">
                      <p className="text-gray-500">Medication</p>
                      <p className="font-medium text-gray-900">
                        {config.medication.timeoutMs}ms · {config.medication.retries} retry
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-2">
                      <p className="text-gray-500">Studies</p>
                      <p className="font-medium text-gray-900">
                        {config.studies.timeoutMs}ms · {config.studies.retries} retry
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-2">
                      <p className="text-gray-500">Documents</p>
                      <p className="font-medium text-gray-900">
                        {config.documents.timeoutMs}ms · {config.documents.retries} retry
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-2">
                      <p className="text-gray-500">Followups</p>
                      <p className="font-medium text-gray-900">
                        {config.followups.timeoutMs}ms · {config.followups.retries} retry
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No se pudo cargar configuración.</p>
                )}
              </section>

              <section className="rounded-xl border border-rene-aquaDark/40 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Métricas rápidas</h2>
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="rounded-md border border-gray-200 p-2">
                    <p className="text-gray-500">Decisiones</p>
                    <p className="font-medium text-gray-900">{stats.total}</p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-2">
                    <p className="text-gray-500">Activadas</p>
                    <p className="font-medium text-emerald-700">{stats.activated}</p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-2">
                    <p className="text-gray-500">No activadas</p>
                    <p className="font-medium text-gray-700">{stats.notActivated}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-rene-aquaDark/40 bg-white p-4">
                <div className="mb-3 grid gap-2 md:grid-cols-4">
                  <label className="text-xs text-gray-600">
                    Agente
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="soap">soap</option>
                      <option value="medication">medication</option>
                      <option value="studies">studies</option>
                      <option value="documents">documents</option>
                      <option value="followups">followups</option>
                    </select>
                  </label>
                  <label className="text-xs text-gray-600">
                    Estado
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="activated">Activados</option>
                      <option value="not_activated">No activados</option>
                    </select>
                  </label>
                  <label className="text-xs text-gray-600">
                    Desde
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs text-gray-600">
                    Hasta
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                </div>
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgent("all");
                      setSelectedStatus("all");
                      setFromDate("");
                      setToDate("");
                    }}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Limpiar filtros
                  </button>
                </div>
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Auditoría reciente</h2>
                {rows.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin registros recientes.</p>
                ) : (
                  <div className="space-y-2 max-h-[55vh] overflow-auto pr-1">
                    {rows.map((r) => (
                      <article key={r.id} className="rounded-md border border-gray-200 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {r.patientName} · {r.agentKey}
                          </p>
                          <span className={`text-xs font-medium ${r.activated ? "text-emerald-700" : "text-gray-500"}`}>
                            {r.activated ? "Activado" : "No activado"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{r.reason}</p>
                        {r.matchedPattern ? (
                          <p className="mt-1 text-xs text-gray-500">Patrón: {r.matchedPattern}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleString("es-AR")} · visita {r.visitId}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
