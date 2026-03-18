import OpenAI from "openai";
import type {
  TranscriptSegment,
  SOAPNote,
  Prescription,
  MedicalOrder,
  PatientSummary,
  Referral,
  Justification,
  LinkedEvidence,
} from "@shared-types";

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is required");
  return new OpenAI({ apiKey: key });
}

const SOAP_SYSTEM = `Eres un asistente médico que genera notas clínicas en formato SOAP para consultorios en Argentina.
Genera texto en español médico estándar argentino.
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.`;

const SOAP_USER = (transcript: string) => `Transcripción de una consulta médica (con etiquetas medico/paciente):

${transcript}

Genera la nota SOAP. Responde con este JSON exacto:
{"subjective":"","objective":"","assessment":"","plan":""}`;

const PRESCRIPTIONS_SYSTEM = `Eres un asistente médico. Extrae las recetas de la transcripción.
Usa nombres genéricos de fármacos cuando sea posible.
Responde ÚNICAMENTE con JSON válido.`;

const PRESCRIPTIONS_USER = (transcript: string) => `Transcripción:
${transcript}

Extrae las recetas. Responde con JSON: {"prescriptions":[{"drug":"","dose":"","frequency":"","route":"","duration":""}]}
Si no hay recetas, devuelve {"prescriptions":[]}`;

const ORDERS_SYSTEM = `Eres un asistente médico. Extrae órdenes médicas: laboratorio, imágenes, interconsultas.
Responde ÚNICAMENTE con JSON válido.`;

const ORDERS_USER = (transcript: string) => `Transcripción:
${transcript}

Extrae órdenes. Responde con JSON: {"orders":[{"type":"lab"|"imaging"|"referral","description":""}]}
Si no hay órdenes, devuelve {"orders":[]}`;

const SUMMARY_SYSTEM = `Eres un asistente médico. Genera un resumen breve para el paciente en lenguaje simple, listo para enviar por WhatsApp.
Máximo 3-4 oraciones. Español argentino coloquial.`;

const SUMMARY_USER = (transcript: string, soap: string) => `Consulta y nota clínica:
${transcript}

Nota SOAP: ${soap}

Genera resumen para paciente. Responde con JSON: {"text":""}`;

function formatTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${s.speaker}] ${s.text}`)
    .join("\n");
}

async function callLLM<T>(system: string, user: string): Promise<T> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  return JSON.parse(content) as T;
}

export async function generateSOAP(segments: TranscriptSegment[]): Promise<SOAPNote> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<SOAPNote>(SOAP_SYSTEM, SOAP_USER(transcript));
  return {
    subjective: result.subjective ?? "",
    objective: result.objective ?? "",
    assessment: result.assessment ?? "",
    plan: result.plan ?? "",
  };
}

export async function generatePrescriptions(segments: TranscriptSegment[]): Promise<Prescription[]> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ prescriptions: Prescription[] }>(
    PRESCRIPTIONS_SYSTEM,
    PRESCRIPTIONS_USER(transcript)
  );
  return result.prescriptions ?? [];
}

export async function generateMedicalOrders(segments: TranscriptSegment[]): Promise<MedicalOrder[]> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ orders: MedicalOrder[] }>(
    ORDERS_SYSTEM,
    ORDERS_USER(transcript)
  );
  return result.orders ?? [];
}

export async function generatePatientSummary(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<PatientSummary> {
  const transcript = formatTranscript(segments);
  const soapStr = JSON.stringify(soap);
  const result = await callLLM<{ text: string }>(
    SUMMARY_SYSTEM,
    SUMMARY_USER(transcript, soapStr)
  );
  return { text: result.text ?? "" };
}

export async function generateReferral(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<Referral> {
  const transcript = formatTranscript(segments);
  const soapStr = JSON.stringify(soap);
  const result = await callLLM<{ text: string; specialist?: string }>(
    "Genera una carta de derivación médica en español argentino. Responde JSON: {\"text\":\"\",\"specialist\":\"\"}",
    `Transcripción: ${transcript}\n\nNota: ${soapStr}`
  );
  return { text: result.text ?? "", specialist: result.specialist };
}

export async function generateJustification(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<Justification> {
  const transcript = formatTranscript(segments);
  const soapStr = JSON.stringify(soap);
  const result = await callLLM<{ text: string }>(
    "Genera justificación para obra social/prepaga en español argentino. Responde JSON: {\"text\":\"\"}",
    `Transcripción: ${transcript}\n\nNota: ${soapStr}`
  );
  return { text: result.text ?? "" };
}

export function buildLinkedEvidence(
  soap: SOAPNote,
  segments: TranscriptSegment[]
): LinkedEvidence[] {
  const evidencias: LinkedEvidence[] = [];
  const blocks: Array<{ type: LinkedEvidence["noteBlockType"]; text: string }> = [
    { type: "subjective", text: soap.subjective },
    { type: "objective", text: soap.objective },
    { type: "assessment", text: soap.assessment },
    { type: "plan", text: soap.plan },
  ];

  for (const block of blocks) {
    const words = block.text.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length < 3) continue;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segWords = seg.text.toLowerCase().split(/\s+/).filter(Boolean);
      const overlap = words.filter((w) => segWords.includes(w)).length;
      if (overlap >= 2) {
        evidencias.push({
          segmentId: String(i),
          noteBlockId: block.type,
          noteBlockType: block.type,
        });
      }
    }
  }
  return evidencias;
}

export async function generateClinicalOutputs(segments: TranscriptSegment[]) {
  const [soap, prescriptions, orders] = await Promise.all([
    generateSOAP(segments),
    generatePrescriptions(segments),
    generateMedicalOrders(segments),
  ]);

  const [patientSummary, referral, justification] = await Promise.all([
    generatePatientSummary(segments, soap),
    generateReferral(segments, soap),
    generateJustification(segments, soap),
  ]);

  const evidencias = buildLinkedEvidence(soap, segments);

  return {
    soap,
    prescriptions,
    orders,
    patientSummary,
    referral,
    justification,
    evidencias,
  };
}
