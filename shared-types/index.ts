// TranscriptSegment - segmento de transcripción con speaker y timestamps
export interface TranscriptSegment {
  id?: string;
  speaker: "medico" | "paciente" | "acompanante";
  timestampStart: number;
  timestampEnd: number;
  text: string;
  confidence?: number;
  lowConfidence?: boolean;
}

// SOAPNote - nota clínica formato SOAP
export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Prescription - receta médica
export interface Prescription {
  id?: string;
  drug: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
}

// MedicalOrder - orden médica (laboratorio, imágenes, interconsulta)
export interface MedicalOrder {
  id?: string;
  type: "lab" | "imaging" | "referral";
  description: string;
}

// LinkedEvidence - mapeo nota ↔ transcripción
export interface LinkedEvidence {
  segmentId: string;
  noteBlockId: string;
  noteBlockType: "subjective" | "objective" | "assessment" | "plan";
}

// PatientSummary - resumen para paciente (WhatsApp-ready)
export interface PatientSummary {
  text: string;
}

// Referral - carta de derivación
export interface Referral {
  text: string;
  specialist?: string;
}

// Justification - justificación para obra social/prepaga
export interface Justification {
  text: string;
}

// ProcessVisitResponse - respuesta del endpoint process
export interface ProcessVisitResponse {
  visitId: string;
  soap: SOAPNote;
  recetas: Prescription[];
  ordenes: MedicalOrder[];
  resumen_paciente: PatientSummary;
  evidencias: LinkedEvidence[];
  referral?: Referral;
  justification?: Justification;
}
