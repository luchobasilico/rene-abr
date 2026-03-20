import OpenAI from "openai";
import type {
  TranscriptSegment,
  SOAPNote,
  PatientSummary,
  Referral,
  Justification,
  LinkedEvidence,
  ExtractedActions,
  ExtractedMedication,
  ExtractedStudy,
  ExtractedDocument,
  sanitizeExtractedActions,
} from "@shared-types";

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is required");
  return new OpenAI({ apiKey: key });
}

const SOAP_SYSTEM = `Eres un asistente médico que genera notas clínicas en formato SOAP para consultorios en Argentina.
Genera texto en español médico estándar argentino.
REGLA CRÍTICA: Usá SOLO información explícita en la transcripción. Si no hay datos clínicos (silencio, audio vacío, texto ininteligible o irrelevante), NO inventes síntomas, diagnósticos ni planes: devolvé cadenas vacías "" o un texto breve en Subjetivo indicando que no hubo información transcrita. Jamás fabriques un caso clínico de ejemplo.
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.`;

const SOAP_BLOCK_USER = (
  transcript: string,
  block: "subjective" | "objective" | "assessment" | "plan",
  currentSoap?: Partial<SOAPNote>
) => `Transcripción de una consulta médica (con etiquetas medico/paciente):

${transcript}

Nota SOAP parcial actual (puede estar vacía):
${JSON.stringify(currentSoap ?? {})}

Genera SOLO el bloque "${block}" con contenido clínico consistente con el resto y con la transcripción.
Si la transcripción no aporta datos para este bloque, devolvé {"text":""} sin inventar.
Responde con este JSON exacto:
{"text":""}`;

const SUMMARY_SYSTEM = `Eres un asistente médico. Genera un resumen breve para el paciente en lenguaje simple, listo para enviar por WhatsApp.
Máximo 3-4 oraciones. Español argentino coloquial.`;

const SUMMARY_USER = (transcript: string, soap: string) => `Consulta y nota clínica:
${transcript}

Nota SOAP: ${soap}

Genera resumen para paciente. Responde con JSON: {"text":""}`;

const MEDICATION_ACTIONS_SYSTEM = `Eres un asistente médico que extrae únicamente medicaciones explícitas.
No inventes medicaciones ausentes.
Responde ÚNICAMENTE JSON válido.`;

const MEDICATION_ACTIONS_USER = (transcript: string, soap?: SOAPNote) => `Transcripción:
${transcript}

Nota SOAP (opcional):
${JSON.stringify(soap ?? {})}

Devuelve JSON: {"medications":[{"drug":"","dose":"","frequency":"","route":"","duration":""}]}
Si no hay medicaciones, devuelve {"medications":[]}.`;

const STUDIES_ACTIONS_SYSTEM = `Eres un asistente médico que extrae únicamente estudios/órdenes explícitas.
No inventes estudios ausentes.
Responde ÚNICAMENTE JSON válido.`;

const STUDIES_ACTIONS_USER = (transcript: string, soap?: SOAPNote) => `Transcripción:
${transcript}

Nota SOAP (opcional):
${JSON.stringify(soap ?? {})}

Devuelve JSON: {"studies":[{"type":"lab"|"imaging"|"referral","description":""}]}
Si no hay estudios, devuelve {"studies":[]}.`;

const DOCUMENTS_ACTIONS_SYSTEM = `Eres un asistente médico que extrae únicamente documentos explícitos a generar.
No inventes documentos ausentes.
Responde ÚNICAMENTE JSON válido.`;

const DOCUMENTS_ACTIONS_USER = (transcript: string, soap?: SOAPNote) => `Transcripción:
${transcript}

Nota SOAP (opcional):
${JSON.stringify(soap ?? {})}

Devuelve JSON: {"documents":[{"type":"certificate"|"report"|"administrative","title":"","rationale":""}]}
Si no hay documentos, devuelve {"documents":[]}.`;

const FOLLOWUPS_ACTIONS_SYSTEM = `Eres un asistente médico que extrae únicamente seguimientos explícitos.
No inventes seguimientos ausentes.
Responde ÚNICAMENTE JSON válido.`;

const FOLLOWUPS_ACTIONS_USER = (transcript: string, soap?: SOAPNote) => `Transcripción:
${transcript}

Nota SOAP (opcional):
${JSON.stringify(soap ?? {})}

Devuelve JSON: {"followups":[""]}.
Si no hay seguimientos, devuelve {"followups":[]}.`;

function formatTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${s.speaker}] ${s.text}`)
    .join("\n");
}

/** Evita llamar al LLM con silencio o audio inútil: el modelo suele alucinar un caso clínico. */
export function hasUsableClinicalTranscript(segments: TranscriptSegment[]): boolean {
  const text = segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 5) return false;
  if (text.replace(/\s+/g, " ").trim().length < 28) return false;
  return true;
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

export async function generateSOAPBlock(
  segments: TranscriptSegment[],
  block: "subjective" | "objective" | "assessment" | "plan",
  currentSoap?: Partial<SOAPNote>
): Promise<string> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ text: string }>(
    SOAP_SYSTEM,
    SOAP_BLOCK_USER(transcript, block, currentSoap)
  );
  return result.text ?? "";
}

export async function generateMedicationActions(
  segments: TranscriptSegment[],
  soap?: SOAPNote
): Promise<ExtractedMedication[]> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ medications: ExtractedMedication[] }>(
    MEDICATION_ACTIONS_SYSTEM,
    MEDICATION_ACTIONS_USER(transcript, soap)
  );
  return sanitizeExtractedActions({ medications: result.medications }).medications;
}

export async function generateStudiesActions(
  segments: TranscriptSegment[],
  soap?: SOAPNote
): Promise<ExtractedStudy[]> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ studies: ExtractedStudy[] }>(
    STUDIES_ACTIONS_SYSTEM,
    STUDIES_ACTIONS_USER(transcript, soap)
  );
  return sanitizeExtractedActions({ studies: result.studies }).studies;
}

export async function generateDocumentsActions(
  segments: TranscriptSegment[],
  soap?: SOAPNote
): Promise<ExtractedDocument[]> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ documents: ExtractedDocument[] }>(
    DOCUMENTS_ACTIONS_SYSTEM,
    DOCUMENTS_ACTIONS_USER(transcript, soap)
  );
  return sanitizeExtractedActions({ documents: result.documents }).documents;
}

export async function generateFollowupsActions(
  segments: TranscriptSegment[],
  soap?: SOAPNote
): Promise<string[]> {
  const transcript = formatTranscript(segments);
  const result = await callLLM<{ followups: string[] }>(
    FOLLOWUPS_ACTIONS_SYSTEM,
    FOLLOWUPS_ACTIONS_USER(transcript, soap)
  );
  return sanitizeExtractedActions({ followups: result.followups }).followups;
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
