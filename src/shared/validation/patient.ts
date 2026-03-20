import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  birthDate: z.string().trim().min(1, "La fecha de nacimiento es obligatoria"),
  document: z.string().trim().min(1, "El DNI es obligatorio"),
  sex: z.string().trim().min(1, "El sexo es obligatorio"),
  coverage: z.string().trim().min(1, "La cobertura de salud es obligatoria"),
  affiliateNumber: z.string().trim().min(1, "El número de afiliado es obligatorio"),
  plan: z.string().trim().optional(),
  phone: z.string().trim().min(1, "WhatsApp es obligatorio"),
  email: z
    .string()
    .trim()
    .min(1, "Email es obligatorio")
    .email("Email inválido"),
  address: z.string().trim().optional(),
});

export type CreatePatientSchemaInput = z.infer<typeof createPatientSchema>;

