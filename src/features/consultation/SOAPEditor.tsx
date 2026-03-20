"use client";

import { useState } from "react";
import { AutoResizeTextarea } from "@/shared/components/AutoResizeTextarea";

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SOAPEditorProps {
  soap: SOAPNote;
  onChange: (soap: SOAPNote) => void;
  onSave: () => void;
  /** Placeholder animado en el primer bloque vacío mientras el backend genera la nota. */
  pendingGeneration?: boolean;
  processingStage?: "idle" | "uploading" | "transcribing" | "generating" | "finalizing" | "error";
}

const BLOCKS: Array<{ key: keyof SOAPNote; label: string }> = [
  { key: "subjective", label: "Subjetivo" },
  { key: "objective", label: "Objetivo" },
  { key: "assessment", label: "Evaluación" },
  { key: "plan", label: "Plan" },
];

const BLOCK_ORDER = BLOCKS.map((b) => b.key);

function BlockSkeleton() {
  return (
    <div
      className="px-4 pb-3 pt-1 space-y-2"
      aria-busy
      aria-label="Generando texto del bloque"
    >
      <div className="h-3 w-[92%] max-w-md rounded bg-rene-aquaDark/25 animate-pulse" />
      <div className="h-3 w-full rounded bg-rene-aquaDark/20 animate-pulse" />
      <div className="h-3 w-4/5 rounded bg-rene-aquaDark/15 animate-pulse" />
    </div>
  );
}

export function SOAPEditor({
  soap,
  onChange,
  onSave,
  pendingGeneration = false,
  processingStage = "idle",
}: SOAPEditorProps) {
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof SOAPNote, value: string) => {
    onChange({ ...soap, [key]: value });
  };

  const handleSave = () => {
    setSaving(true);
    onSave();
    setTimeout(() => setSaving(false), 500);
  };

  const handleCopy = () => {
    const text = BLOCKS.map((b) => `${b.label}:\n${soap[b.key]}`).join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const allEmpty = BLOCK_ORDER.every((k) => !(soap[k] ?? "").trim());
  const showTranscribingHint =
    pendingGeneration &&
    allEmpty &&
    (processingStage === "transcribing" || processingStage === "uploading");

  return (
    <div className="bg-white border border-rene-aquaDark/40 rounded-lg overflow-hidden flex flex-col h-auto min-h-0 w-full">
      {showTranscribingHint ? (
        <p className="text-xs text-gray-500 px-4 pt-3 pb-1">Transcribiendo audio…</p>
      ) : null}
      <div className="w-full">
        {BLOCKS.map(({ key, label }, index) => {
          // Solo en Subjetivo: si mostramos esqueleto en el siguiente bloque vacío mientras el
          // anterior se anima, quedarían dos “cargando” a la vez.
          const showSkeleton =
            pendingGeneration &&
            !showTranscribingHint &&
            key === "subjective" &&
            !(soap.subjective ?? "").trim();
          return (
            <div
              key={key}
              className="border-b border-rene-aquaDark/20 last:border-0 last:pb-0"
            >
              <label
                className={`block px-4 text-sm font-medium text-gray-600 ${
                  index === 0 ? "pt-1 pb-0.5" : "pt-2 pb-0.5"
                }`}
              >
                {label}
              </label>
              {showSkeleton ? (
                <BlockSkeleton />
              ) : (
                <AutoResizeTextarea
                  value={soap[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-4 pb-2 pt-0 text-sm leading-relaxed border-0 focus:ring-0"
                  placeholder={`${label}...`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 p-3 bg-rene-aqua/50 border-t border-rene-aquaDark/40 shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 text-sm bg-rene-green text-white rounded-lg hover:bg-rene-greenDark disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm bg-rene-aquaDark/50 text-rene-greenDark rounded-lg hover:bg-rene-aquaDark"
        >
          Copiar
        </button>
      </div>
    </div>
  );
}
