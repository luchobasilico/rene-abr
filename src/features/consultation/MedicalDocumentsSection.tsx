"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";

/** 15 documentos clínicos frecuentes (Argentina / atención primaria). */
export const MEDICAL_DOCUMENT_TYPES: Array<{ id: string; label: string; hint: string }> = [
  { id: "cert_general", label: "Certificado médico general", hint: "Asistencia, diagnóstico resumido o aptitud." },
  { id: "cert_reposo", label: "Certificado de reposo / licencia", hint: "Días de reposo e indicaciones básicas." },
  { id: "cert_escolar", label: "Certificado escolar / deportivo", hint: "Apto, exámenes o restricciones." },
  { id: "cert_laboral", label: "Certificado laboral / preocupacional", hint: "Aptitud, restricciones o seguimiento." },
  { id: "receta", label: "Receta oficial / electrónica", hint: "Medicación con vademécum y vías." },
  { id: "orden_lab", label: "Orden de laboratorio", hint: "Estudios bioquímicos, hemograma, etc." },
  { id: "orden_img", label: "Orden de imagenología", hint: "RX, TAC, RM, ecografía, etc." },
  { id: "nota_derivacion", label: "Nota de derivación / interconsulta", hint: "Motivo, resumen y especialidad." },
  { id: "carta_especialista", label: "Carta al especialista", hint: "Historia breve y consulta solicitada." },
  { id: "justif_os", label: "Justificación obra social", hint: "Tratamiento, medicación o práctica solicitada." },
  { id: "consentimiento", label: "Consentimiento informado", hint: "Procedimiento, riesgos y alternativas." },
  { id: "epicrisis", label: "Epicrisis / resumen de alta", hint: "Resumen de internación o episodio." },
  { id: "informe_detallado", label: "Informe médico detallado", hint: "Informe extenso para terceros." },
  { id: "cert_vacuna", label: "Certificado de vacunación / inmunizaciones", hint: "Esquema o refuerzos indicados." },
  { id: "alta_seguimiento", label: "Alta médica / plan de seguimiento", hint: "Indicaciones post consulta o alta." },
];

export function MedicalDocumentsSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = openId ? MEDICAL_DOCUMENT_TYPES.find((d) => d.id === openId) : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-600">
        Elegí un tipo de documento. Pronto podrás generarlo con IA a partir de la nota clínica y la
        transcripción.
      </p>
      <ul className="grid gap-2 sm:grid-cols-1">
        {MEDICAL_DOCUMENT_TYPES.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => setOpenId(doc.id)}
              className="w-full text-left rounded-lg border border-rene-aquaDark/35 bg-rene-aqua/30 px-3 py-2.5 text-sm transition hover:bg-rene-brand/25 hover:border-rene-aquaDark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rene-green/50"
            >
              <span className="font-semibold text-rene-greenDark block">{doc.label}</span>
              <span className="text-xs text-gray-600 mt-0.5 block">{doc.hint}</span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={!!selected}
        onClose={() => setOpenId(null)}
        title={selected?.label ?? "Documento"}
      >
        <p className="text-sm text-gray-600 mb-2">{selected?.hint}</p>
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">En desarrollo:</span> generación asistida con IA usando
          datos de la consulta actual.
        </p>
      </Modal>
    </div>
  );
}
