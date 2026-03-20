"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConsultationStore } from "@/shared/store/useConsultationStore";
import type { MedicalDocumentType } from "./useMedicalDocuments";

function formatDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString("es-AR");
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString("es-AR");
  return d.toLocaleDateString("es-AR");
}

function buildDocumentDraft(
  doc: MedicalDocumentType | null,
  data: ReturnType<typeof useConsultationStore.getState>["selectedVisit"]
): string {
  if (!doc || !data) return "";

  const soap = data.soap ?? {
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  };
  const patient = data.patient?.name ?? "Paciente";
  const date = formatDate(data.signedAt);
  const summary = data.patientSummary?.trim() || "Sin resumen clínico disponible.";
  const reason = soap.assessment?.trim() || soap.subjective?.trim() || "Motivo clínico no especificado.";
  const plan = soap.plan?.trim() || "Sin plan terapéutico registrado.";
  const objective = soap.objective?.trim() || "Sin hallazgos objetivos relevantes registrados.";
  const specialist = data.referral?.specialist?.trim() || "[Especialidad / profesional destinatario]";

  const baseHeader = [
    `${doc.label.toUpperCase()}`,
    "",
    `Paciente: ${patient}`,
    `Fecha: ${date}`,
    "",
  ];

  const defaultFooter = [
    "",
    "Documento generado como borrador asistido. Requiere validación y firma médica.",
  ];

  if (doc.id === "cert_reposo") {
    return [
      ...baseHeader,
      "Se certifica que el/la paciente requiere reposo laboral/escolar por cuadro clínico actual.",
      `Fundamento clínico: ${reason}`,
      "",
      "Reposo indicado por: [___] días corridos, a partir de la fecha.",
      "Reevaluación: [fecha de control].",
      "",
      "Observaciones:",
      plan,
      ...defaultFooter,
    ].join("\n");
  }

  if (doc.id === "justif_os") {
    return [
      ...baseHeader,
      "A quien corresponda (Obra social / prepaga):",
      "",
      "Por la presente se justifica la indicación de práctica/tratamiento por necesidad médica.",
      `Diagnóstico / fundamento: ${reason}`,
      `Resumen clínico: ${summary}`,
      "",
      "Práctica / cobertura solicitada: [completar].",
      "Prioridad clínica: [habitual / preferente / urgente].",
      "",
      "Plan y seguimiento:",
      plan,
      ...defaultFooter,
    ].join("\n");
  }

  if (doc.id === "consentimiento") {
    return [
      ...baseHeader,
      "CONSENTIMIENTO INFORMADO",
      "",
      "Procedimiento/intervención propuesta: [completar].",
      `Motivo clínico: ${reason}`,
      `Hallazgos relevantes: ${objective}`,
      "",
      "Beneficios esperados: [completar].",
      "Riesgos y complicaciones potenciales: [completar].",
      "Alternativas discutidas: [completar].",
      "",
      "El/la paciente declara haber recibido información comprensible y poder realizar preguntas.",
      "",
      "Firma paciente: ____________________",
      "Firma profesional: ____________________",
      ...defaultFooter,
    ].join("\n");
  }

  if (doc.id === "carta_especialista") {
    return [
      ...baseHeader,
      `Interconsulta dirigida a: ${specialist}`,
      "",
      `Motivo de derivación: ${reason}`,
      `Resumen de evolución: ${summary}`,
      "",
      "Pregunta clínica para especialista:",
      "[completar]",
      "",
      "Conducta actual / tratamiento en curso:",
      plan,
      ...defaultFooter,
    ].join("\n");
  }

  return [
    ...baseHeader,
    `Motivo: ${reason}`,
    "",
    `Resumen clínico:`,
    summary,
    "",
    `Indicaciones / plan:`,
    plan,
    ...defaultFooter,
  ].join("\n");
}

export function useDocumentDraft(selected: MedicalDocumentType | null) {
  const selectedVisit = useConsultationStore((s) => s.selectedVisit);
  const [draft, setDraft] = useState("");

  const generatedDraft = useMemo(
    () => buildDocumentDraft(selected, selectedVisit),
    [selected, selectedVisit]
  );

  useEffect(() => {
    setDraft(generatedDraft);
  }, [generatedDraft]);

  const copyDraft = useCallback(async () => {
    if (!draft.trim() || typeof navigator === "undefined" || !navigator.clipboard) return false;
    await navigator.clipboard.writeText(draft);
    return true;
  }, [draft]);

  const sendByWhatsapp = useCallback(() => {
    const rawPhone = selectedVisit?.patient?.phone ?? "";
    const normalizedPhone = rawPhone.replace(/\D/g, "");
    if (!normalizedPhone || !draft.trim() || typeof window === "undefined") return false;
    const text = encodeURIComponent(draft);
    window.open(`https://wa.me/${normalizedPhone}?text=${text}`, "_blank");
    return true;
  }, [draft, selectedVisit?.patient?.phone]);

  return {
    draft,
    setDraft,
    hasVisitContext: !!selectedVisit,
    hasPatientPhone: !!selectedVisit?.patient?.phone,
    copyDraft,
    sendByWhatsapp,
  };
}
