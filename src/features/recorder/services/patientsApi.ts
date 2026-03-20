import type { CreatePatientInput, PatientOption } from "../types";

export async function fetchPatients(): Promise<PatientOption[]> {
  const res = await fetch("/api/patients");
  if (!res.ok) {
    throw new Error("No se pudieron obtener pacientes");
  }
  return (await res.json()) as PatientOption[];
}

export async function createPatientApi(input: CreatePatientInput): Promise<PatientOption> {
  const res = await fetch("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "No se pudo crear el paciente");
  }

  return (await res.json()) as PatientOption;
}

