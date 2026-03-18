"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Segment {
  speaker: string;
  timestampStart: number;
  timestampEnd: number;
  text: string;
}

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const BLOCKS: Array<{ key: keyof SOAPNote; label: string }> = [
  { key: "subjective", label: "Subjetivo" },
  { key: "objective", label: "Objetivo" },
  { key: "assessment", label: "Evaluación" },
  { key: "plan", label: "Plan" },
];

function buildEvidenceMap(soap: SOAPNote, segments: Segment[]): Map<string, number[]> {
  const map = new Map<string, number[]>();
  for (const block of BLOCKS) {
    const text = soap[block.key].toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < 2) continue;
    const indices: number[] = [];
    segments.forEach((seg, i) => {
      const segWords = seg.text.toLowerCase().split(/\s+/).filter(Boolean);
      const overlap = words.filter((w) => segWords.includes(w)).length;
      if (overlap >= 2) indices.push(i);
    });
    if (indices.length > 0) map.set(block.key, indices);
  }
  return map;
}

export function LinkedEvidenceViewer() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const [visit, setVisit] = useState<{
    soap: SOAPNote;
    transcript: { segments: Segment[] };
  } | null>(null);
  const [highlightedBlock, setHighlightedBlock] = useState<string | null>(null);
  const [highlightedSegments, setHighlightedSegments] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!visitId) return;
    fetch(`/api/visits/${visitId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.soap && data.transcript) {
          setVisit({
            soap: data.soap,
            transcript: data.transcript,
          });
        }
      })
      .catch(() => {});
  }, [visitId]);

  const evidenceMap = visit
    ? buildEvidenceMap(visit.soap, visit.transcript.segments)
    : new Map<string, number[]>();

  const handleBlockClick = (blockKey: string) => {
    const indices = evidenceMap.get(blockKey);
    setHighlightedBlock(blockKey);
    setHighlightedSegments(indices ? new Set(indices) : new Set());
  };

  const handleSegmentClick = (index: number) => {
    setHighlightedBlock(null);
    Array.from(evidenceMap.entries()).forEach(([blockKey, indices]) => {
      if (indices.includes(index)) {
        setHighlightedBlock(blockKey);
      }
    });
    setHighlightedSegments(new Set([index]));
  };

  if (!visitId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Seleccioná una consulta desde el dashboard.</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <a href={`/dashboard?visitId=${visitId}`} className="text-blue-600 hover:underline">
          ← Volver al dashboard
        </a>
        <h1 className="font-semibold">Evidencia enlazada</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4 bg-white">
          <h2 className="font-medium mb-4">Nota SOAP</h2>
          {BLOCKS.map(({ key, label }) => (
            <div
              key={key}
              onClick={() => handleBlockClick(key)}
              className={`mb-4 p-3 rounded-lg cursor-pointer transition ${
                highlightedBlock === key
                  ? "bg-blue-100 ring-2 ring-blue-400"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">{label}</h3>
              <p className="text-sm whitespace-pre-wrap">{visit.soap[key]}</p>
            </div>
          ))}
        </div>

        <div className="w-1/2 overflow-y-auto p-4">
          <h2 className="font-medium mb-4">Transcripción</h2>
          <div className="space-y-2">
            {visit.transcript.segments.map((seg, i) => (
              <div
                key={i}
                onClick={() => handleSegmentClick(i)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  highlightedSegments.has(i)
                    ? "bg-blue-100 ring-2 ring-blue-400"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xs text-gray-500 font-medium">
                  [{seg.speaker}] {seg.timestampStart}s - {seg.timestampEnd}s
                </span>
                <p className="text-sm mt-1">{seg.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
