"use client";

interface StudiesAnalysisSectionProps {
  studies: Array<{ type: string; description: string }>;
}

function groupLabel(type: string): string {
  if (type === "lab") return "Laboratorio";
  if (type === "imaging") return "Imagenología";
  return "Derivación";
}

function recommendationByType(type: string): string {
  if (type === "lab") return "Verificar preparación del paciente y valores críticos al recibir resultados.";
  if (type === "imaging") return "Contrastar hallazgos con clínica y revisar necesidad de control evolutivo.";
  return "Registrar motivo de interconsulta y criterio de urgencia para seguimiento.";
}

export function StudiesAnalysisSection({ studies }: StudiesAnalysisSectionProps) {
  if (!studies.length) {
    return (
      <p className="text-sm text-gray-500">
        No hay estudios cargados para analizar en esta consulta.
      </p>
    );
  }

  const grouped = studies.reduce<Record<string, Array<{ type: string; description: string }>>>(
    (acc, current) => {
      const key = current.type || "referral";
      if (!acc[key]) acc[key] = [];
      acc[key].push(current);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-rene-aquaDark/30 bg-rene-aqua/20 p-3">
        <p className="text-sm text-gray-700">
          Se detectaron <span className="font-semibold text-rene-greenDark">{studies.length}</span>{" "}
          {studies.length === 1 ? "estudio/orden" : "estudios/órdenes"} en la consulta.
        </p>
      </div>
      {Object.entries(grouped).map(([type, list]) => (
        <section key={type} className="rounded-lg border border-rene-aquaDark/35 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-rene-greenDark">{groupLabel(type)}</p>
            <span className="text-xs text-gray-500">{list.length}</span>
          </div>
          <ul className="mt-2 space-y-2">
            {list.map((study, idx) => (
              <li key={`${type}-${idx}`} className="rounded-md border border-gray-200 px-2.5 py-2 text-sm text-gray-700">
                {study.description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">{recommendationByType(type)}</p>
        </section>
      ))}
    </div>
  );
}
