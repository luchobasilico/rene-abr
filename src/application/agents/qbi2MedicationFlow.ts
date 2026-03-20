import type { ExtractedMedication, SOAPNote } from "@shared-types";

export type Qbi2TipoDoc = "Pasaporte" | "DNI" | "LE" | "LC" | "CI";
export type Qbi2Sexo = "F" | "M" | "X" | "O";
export type Qbi2MatriculaTipo = "MP" | "MN";

export interface Qbi2ValidationError {
  path: string;
  code: "required" | "invalid_format" | "invalid_length" | "invalid_enum" | "conditional_required";
  message: string;
  blocking: true;
}

export interface Qbi2ValidationResult {
  valid: boolean;
  errors: Qbi2ValidationError[];
}

export type MedicationIssueStatus =
  | "ready_to_issue"
  | "blocked_missing_patient_fields"
  | "blocked_missing_professional_fields"
  | "blocked_invalid_payload";

export interface Qbi2PacienteRequest {
  apellido: string;
  nombre: string;
  tipoDoc: Qbi2TipoDoc;
  nroDoc: string;
  fechaNacimiento: string;
  sexo: Qbi2Sexo;
}

export interface Qbi2MedicoRequest {
  apellido: string;
  nombre: string;
  tipoDoc: Qbi2TipoDoc;
  nroDoc: string;
  sexo: Qbi2Sexo;
  matricula: {
    tipo: Qbi2MatriculaTipo;
    numero: string;
    provincia?: string;
  };
}

export interface Qbi2RecipeRequest {
  paciente: Qbi2PacienteRequest;
  medico: Qbi2MedicoRequest;
  medicamentos: Array<{ cantidad: number; regNo?: string; nombreDroga?: string; presentacion?: string }>;
  clienteAppId: number;
  lugarAtencion: { nombre: string };
  observaciones?: string;
}

export interface MedicationIssueDecision {
  status: MedicationIssueStatus;
  validation: Qbi2ValidationResult;
  payload: Qbi2RecipeRequest;
}

interface InputPatient {
  name?: string;
  document?: string;
  birthDate?: Date;
  sex?: string;
}

interface InputProfessional {
  name?: string;
}

interface Qbi2MedicationFlowInput {
  patient: InputPatient;
  professional: InputProfessional;
  medications: ExtractedMedication[];
  soap: SOAPNote;
}

function splitName(fullName?: string): { nombre: string; apellido: string } {
  const normalized = (fullName ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) return { nombre: "", apellido: "" };
  const parts = normalized.split(" ");
  if (parts.length === 1) return { nombre: parts[0], apellido: parts[0] };
  return {
    nombre: parts.slice(0, -1).join(" "),
    apellido: parts[parts.length - 1],
  };
}

function mapSexo(value?: string): Qbi2Sexo | "" {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "F" || normalized === "M" || normalized === "X" || normalized === "O") return normalized;
  return "";
}

function formatDate(value?: Date): string {
  if (!value || Number.isNaN(value.getTime())) return "";
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function inferDocType(document?: string): Qbi2TipoDoc | "" {
  const digits = (document ?? "").replace(/\D/g, "");
  if (digits.length >= 4 && digits.length <= 9) return "DNI";
  return "";
}

export function buildQbi2RecipeRequest(input: Qbi2MedicationFlowInput): Qbi2RecipeRequest {
  const patientName = splitName(input.patient.name);
  const doctorName = splitName(input.professional.name);
  const inferredDocType = inferDocType(input.patient.document);
  const normalizedDoc = (input.patient.document ?? "").replace(/\D/g, "");

  return {
    paciente: {
      apellido: patientName.apellido,
      nombre: patientName.nombre,
      tipoDoc: (inferredDocType || "DNI") as Qbi2TipoDoc,
      nroDoc: normalizedDoc,
      fechaNacimiento: formatDate(input.patient.birthDate),
      sexo: (mapSexo(input.patient.sex) || "O") as Qbi2Sexo,
    },
    medico: {
      apellido: doctorName.apellido,
      nombre: doctorName.nombre,
      tipoDoc: "DNI",
      nroDoc: "",
      sexo: "O",
      matricula: {
        tipo: "MN",
        numero: "",
      },
    },
    medicamentos: input.medications.map((m) => ({
      cantidad: 1,
      nombreDroga: m.drug,
      presentacion: [m.dose, m.route, m.frequency, m.duration].filter(Boolean).join(" | "),
    })),
    clienteAppId: Number.parseInt(process.env.QBI2_CLIENTE_APP_ID ?? "0", 10) || 0,
    lugarAtencion: {
      nombre: process.env.QBI2_LUGAR_ATENCION ?? "",
    },
    observaciones: input.soap.plan || undefined,
  };
}

export function validateQbi2RecipeRequest(payload: Qbi2RecipeRequest): Qbi2ValidationResult {
  const errors: Qbi2ValidationError[] = [];
  const required = (condition: boolean, path: string, message: string) => {
    if (!condition) errors.push({ path, code: "required", message, blocking: true });
  };

  required(!!payload.paciente.nombre.trim(), "paciente.nombre", "Nombre de paciente obligatorio");
  required(!!payload.paciente.apellido.trim(), "paciente.apellido", "Apellido de paciente obligatorio");
  required(!!payload.paciente.nroDoc.trim(), "paciente.nroDoc", "Documento de paciente obligatorio");
  required(!!payload.paciente.fechaNacimiento.trim(), "paciente.fechaNacimiento", "Fecha nacimiento obligatoria");
  required(!!payload.medico.nombre.trim(), "medico.nombre", "Nombre de médico obligatorio");
  required(!!payload.medico.apellido.trim(), "medico.apellido", "Apellido de médico obligatorio");
  required(!!payload.medico.nroDoc.trim(), "medico.nroDoc", "Documento de médico obligatorio");
  required(!!payload.medico.matricula.numero.trim(), "medico.matricula.numero", "Matrícula obligatoria");
  required(payload.clienteAppId > 0, "clienteAppId", "clienteAppId obligatorio");
  required(!!payload.lugarAtencion.nombre.trim(), "lugarAtencion.nombre", "Lugar de atención obligatorio");
  required(payload.medicamentos.length > 0, "medicamentos", "Debe existir al menos un medicamento");

  return { valid: errors.length === 0, errors };
}

export function runMedicationIssuingFlow(input: Qbi2MedicationFlowInput): MedicationIssueDecision {
  const payload = buildQbi2RecipeRequest(input);
  const validation = validateQbi2RecipeRequest(payload);
  if (!validation.valid) {
    const hasPatientError = validation.errors.some((e) => e.path.startsWith("paciente."));
    const hasDoctorError = validation.errors.some((e) => e.path.startsWith("medico."));
    if (hasPatientError) return { status: "blocked_missing_patient_fields", validation, payload };
    if (hasDoctorError) return { status: "blocked_missing_professional_fields", validation, payload };
    return { status: "blocked_invalid_payload", validation, payload };
  }
  return { status: "ready_to_issue", validation, payload };
}
