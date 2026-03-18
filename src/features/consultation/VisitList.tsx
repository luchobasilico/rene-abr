"use client";

import { useState } from "react";

interface VisitSummary {
  id: string;
  patientName: string;
  createdAt: string;
  signedAt?: string;
}

interface VisitListProps {
  visits: VisitSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function VisitList({ visits, selectedId, onSelect, loading }: VisitListProps) {
  const [search, setSearch] = useState("");

  const filtered = visits.filter((v) =>
    v.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-2">
        <input
          type="search"
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {loading ? (
          <li className="p-4 text-sm text-gray-500">Cargando…</li>
        ) : filtered.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">Sin consultas</li>
        ) : (
          filtered.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => onSelect(v.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                  selectedId === v.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <span className="font-medium text-sm block">{v.patientName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(v.createdAt).toLocaleDateString("es-AR")}
                  {v.signedAt && " • Firmada"}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
