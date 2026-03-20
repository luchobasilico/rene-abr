import type { PatientFormFields } from "../types";

export function buildWhatsappInviteMessage(): string {
  return (
    "Hola! Para darte de alta en consulta médica, por favor respondé con:\n" +
    "- Nombre y apellido\n" +
    "- DNI\n" +
    "- Fecha de nacimiento (AAAA-MM-DD)\n" +
    "- Sexo\n" +
    "- Cobertura de salud\n" +
    "- N° de afiliado\n" +
    "- Plan (opcional)\n" +
    "- WhatsApp\n" +
    "- Email\n" +
    "- Domicilio (opcional)"
  );
}

export function parseQrPatientData(raw: string): Partial<PatientFormFields> {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  try {
    const parsed = JSON.parse(trimmed) as Partial<PatientFormFields>;
    return sanitizePartial(parsed);
  } catch {
    // parse key-value fallback
  }

  const result: Partial<PatientFormFields> = {};
  const pairs = trimmed.split(/[;|]/).map((x) => x.trim());
  for (const pair of pairs) {
    const [k, v] = pair.split(":").map((x) => x.trim());
    if (!k || !v) continue;
    const key = k.toLowerCase();
    if (key.includes("name") || key.includes("nombre")) result.name = v;
    if (key.includes("doc") || key.includes("dni")) result.document = v;
    if (key.includes("nacimiento") || key.includes("birth")) result.birthDate = v;
    if (key.includes("sexo")) result.sex = v;
    if (key.includes("cobertura") || key.includes("obra")) result.coverage = v;
    if (key.includes("afiliado")) result.affiliateNumber = v;
    if (key.includes("plan")) result.plan = v;
    if (key.includes("phone") || key.includes("tel") || key.includes("whatsapp")) result.phone = v;
    if (key.includes("mail") || key.includes("email")) result.email = v;
    if (key.includes("domicilio") || key.includes("address")) result.address = v;
  }
  return sanitizePartial(result);
}

function sanitizePartial(input: Partial<PatientFormFields>): Partial<PatientFormFields> {
  const output: Partial<PatientFormFields> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string" && v.trim()) {
      output[k as keyof PatientFormFields] = v.trim();
    }
  }
  return output;
}

