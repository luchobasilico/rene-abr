"use client";

import { Modal } from "@/shared/ui/Modal";
import {
  CATEGORY_LABELS,
  type DocumentCategory,
  useMedicalDocuments,
} from "./hooks/useMedicalDocuments";
import { useDocumentDraft } from "./hooks/useDocumentDraft";

export function MedicalDocumentsSection() {
  const {
    query,
    setQuery,
    selected,
    grouped,
    totalVisible,
    openCategories,
    toggleCategory,
    setOpenId,
  } = useMedicalDocuments();
  const { draft, setDraft, hasVisitContext, hasPatientPhone, copyDraft, sendByWhatsapp } =
    useDocumentDraft(selected);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-600">
        Elegí un tipo de documento. Backlog `UI-003`: generación asistida con IA a partir de la
        nota clínica y la transcripción.
      </p>
      <div className="rounded-lg border border-rene-aquaDark/35 bg-white p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar documento..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rene-green/50"
        />
      </div>
      {totalVisible === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron documentos para esa búsqueda.</p>
      ) : (
        (Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((category) => {
          const docs = grouped[category];
          if (docs.length === 0) return null;
          const isOpen = openCategories[category];
          return (
            <section key={category} className="rounded-lg border border-rene-aquaDark/30 bg-white/80 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-rene-aqua/30 transition"
              >
                <span className="text-sm font-semibold text-rene-greenDark">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs text-gray-600">
                  {docs.length} {docs.length === 1 ? "documento" : "documentos"} {isOpen ? "▲" : "▼"}
                </span>
              </button>
              {isOpen ? (
                <ul className="grid gap-1 p-2 pt-0 sm:grid-cols-1">
                  {docs.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(doc.id)}
                        className="w-full text-left rounded-md border border-rene-aquaDark/30 bg-rene-aqua/20 px-3 py-1.5 text-sm transition hover:bg-rene-brand/20 hover:border-rene-aquaDark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rene-green/50"
                      >
                        <span className="font-medium text-rene-greenDark block leading-tight truncate">
                          {doc.label}
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight truncate">
                          {doc.hint}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setOpenId(null)}
        title={selected?.label ?? "Documento"}
      >
        <p className="text-sm text-gray-600 mb-2">{selected?.hint}</p>
        {!hasVisitContext ? (
          <p className="text-sm text-gray-500">
            Seleccioná una consulta para generar un borrador de documento con contexto clínico.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Borrador asistido para revisión médica manual (HITL).
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={12}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono whitespace-pre-wrap focus:outline-none focus-visible:ring-2 focus-visible:ring-rene-green/50"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void copyDraft();
                }}
                className="rounded-md border border-rene-aquaDark/40 px-3 py-1.5 text-sm text-gray-700 hover:bg-rene-aqua/30"
              >
                Copiar borrador
              </button>
              <button
                type="button"
                onClick={sendByWhatsapp}
                disabled={!hasPatientPhone}
                className="rounded-md bg-rene-green px-3 py-1.5 text-sm text-white hover:bg-rene-greenDark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar por WhatsApp
              </button>
            </div>
            {!hasPatientPhone ? (
              <p className="text-xs text-gray-500">
                El paciente no tiene teléfono cargado para envío directo por WhatsApp.
              </p>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
