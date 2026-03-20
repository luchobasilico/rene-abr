export type RecordingState = "idle" | "recording" | "processing";
export type PatientModalView = "choose" | "existing" | "add";
export type AddPatientOption = "manual" | "whatsapp" | "qr";

export interface PatientOption {
  id: string;
  name: string;
  birthDate?: string | null;
  document?: string | null;
  sex?: string | null;
  coverage?: string | null;
  affiliateNumber?: string | null;
  plan?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface CreatePatientInput {
  name: string;
  birthDate: string;
  document: string;
  sex: string;
  coverage: string;
  affiliateNumber: string;
  plan?: string;
  phone: string;
  email: string;
  address?: string;
}

export interface PatientFormFields {
  name: string;
  birthDate: string;
  document: string;
  sex: string;
  coverage: string;
  affiliateNumber: string;
  plan: string;
  phone: string;
  email: string;
  address: string;
}

