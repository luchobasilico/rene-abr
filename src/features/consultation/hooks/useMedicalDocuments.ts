"use client";

import { useMemo, useState } from "react";

export type DocumentCategory = "certificados" | "informes" | "administrativo_legal";

export interface MedicalDocumentType {
  id: string;
  label: string;
  hint: string;
  category: DocumentCategory;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  certificados: "Certificados",
  informes: "Informes y evolución",
  administrativo_legal: "Administrativo y legal",
};

export const MEDICAL_DOCUMENT_TYPES: MedicalDocumentType[] = [
  {
    id: "cert_general",
    label: "Certificado médico general",
    hint: "Asistencia, diagnóstico resumido o aptitud.",
    category: "certificados",
  },
  {
    id: "cert_reposo",
    label: "Certificado de reposo / licencia",
    hint: "Días de reposo e indicaciones básicas.",
    category: "certificados",
  },
  {
    id: "cert_escolar",
    label: "Certificado escolar / deportivo",
    hint: "Apto, exámenes o restricciones.",
    category: "certificados",
  },
  {
    id: "cert_laboral",
    label: "Certificado laboral / preocupacional",
    hint: "Aptitud, restricciones o seguimiento.",
    category: "certificados",
  },
  {
    id: "cert_vacuna",
    label: "Certificado de vacunación / inmunizaciones",
    hint: "Esquema o refuerzos indicados.",
    category: "certificados",
  },
  {
    id: "epicrisis",
    label: "Epicrisis / resumen de alta",
    hint: "Resumen de internación o episodio.",
    category: "informes",
  },
  {
    id: "informe_detallado",
    label: "Informe médico detallado",
    hint: "Informe extenso para terceros.",
    category: "informes",
  },
  {
    id: "alta_seguimiento",
    label: "Alta médica / plan de seguimiento",
    hint: "Indicaciones post consulta o alta.",
    category: "informes",
  },
  {
    id: "carta_especialista",
    label: "Carta al especialista",
    hint: "Historia breve y consulta solicitada.",
    category: "administrativo_legal",
  },
  {
    id: "justif_os",
    label: "Justificación obra social",
    hint: "Tratamiento, medicación o práctica solicitada.",
    category: "administrativo_legal",
  },
  {
    id: "consentimiento",
    label: "Consentimiento informado",
    hint: "Procedimiento, riesgos y alternativas.",
    category: "administrativo_legal",
  },
];

export function useMedicalDocuments() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<DocumentCategory, boolean>>({
    certificados: false,
    informes: false,
    administrativo_legal: false,
  });

  const selected = openId ? MEDICAL_DOCUMENT_TYPES.find((d) => d.id === openId) ?? null : null;
  const normalizedQuery = query.trim().toLowerCase();

  const grouped = useMemo(() => {
    const base: Record<DocumentCategory, MedicalDocumentType[]> = {
      certificados: [],
      informes: [],
      administrativo_legal: [],
    };
    MEDICAL_DOCUMENT_TYPES.forEach((doc) => {
      const matches =
        !normalizedQuery ||
        doc.label.toLowerCase().includes(normalizedQuery) ||
        doc.hint.toLowerCase().includes(normalizedQuery);
      if (matches) base[doc.category].push(doc);
    });
    return base;
  }, [normalizedQuery]);

  const totalVisible =
    grouped.certificados.length + grouped.informes.length + grouped.administrativo_legal.length;

  const toggleCategory = (category: DocumentCategory) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return {
    query,
    setQuery,
    selected,
    grouped,
    totalVisible,
    openCategories,
    toggleCategory,
    setOpenId,
  };
}
