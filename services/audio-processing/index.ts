import { AssemblyAI } from "assemblyai";
import type { TranscriptSegment } from "@shared-types";

const FILLERS = [
  "eh",
  "em",
  "este",
  "o sea",
  "bueno",
  "entonces",
  "como",
  "digamos",
  "en fin",
  "claro",
  "mm",
  "mmm",
  "ah",
  "uh",
];

const MEDICAL_QUESTION_PATTERNS = [
  /\b(qué|como|cuándo|dónde|desde cuándo)\b/i,
  /\b(duele|duele|molesta|molestan)\b/i,
  /\b(tiene|tenés|siente|sentís)\b/i,
  /\b(tomá|tomás|toma|tomas)\s+(alguna|algún)\b/i,
  /\b(alguna vez|algún antecedente)\b/i,
  /\b(tratamiento|medicación|medicamentos)\b/i,
  /\b(consulta|consultó|consultaste)\b/i,
  /\b(estudios|análisis|laboratorio)\b/i,
];

const PATIENT_SYMPTOM_PATTERNS = [
  /\b(dolor|dolores|molestias)\b/i,
  /\b(síntomas|síntoma)\b/i,
  /\b(me duele|me molesta|me duele)\b/i,
  /\b(vengo por|vine por|consulto por)\b/i,
  /\b(desde hace|hace \d+)\b/i,
  /\b(me recetaron|me dieron|tomo)\b/i,
];

function isLikelyMedico(text: string): boolean {
  return MEDICAL_QUESTION_PATTERNS.some((p) => p.test(text));
}

function isLikelyPaciente(text: string): boolean {
  return PATIENT_SYMPTOM_PATTERNS.some((p) => p.test(text));
}

export async function preprocessAudio(audioBuffer: Buffer): Promise<Buffer> {
  // MVP: pass-through. Full preprocessing (normalize, denoise, mono 16kHz)
  // can be added with ffmpeg/sox when needed.
  return audioBuffer;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePollingIntervalMs(): number {
  const raw = process.env.ASSEMBLYAI_POLLING_INTERVAL_MS;
  if (!raw) return 800;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 200 ? n : 800;
}

/** Sin diarización suele ser más rápido; el rol medico/paciente será menos fiable. */
function useSpeakerLabels(): boolean {
  const v = process.env.ASSEMBLYAI_SPEAKER_LABELS?.toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}

function segmentsFromPlainText(
  transcript: { text?: string | null; audio_duration?: number | null }
): TranscriptSegment[] {
  const text = transcript.text?.trim() ?? "";
  if (!text) {
    throw new Error("Transcription failed: empty text");
  }
  const durationSec =
    typeof transcript.audio_duration === "number" && transcript.audio_duration > 0
      ? Math.round(transcript.audio_duration)
      : 0;
  return postProcess([
    {
      speaker: "medico",
      timestampStart: 0,
      timestampEnd: durationSec,
      text,
      confidence: 1,
      lowConfidence: false,
    },
  ]);
}

export async function transcribe(audioBuffer: Buffer): Promise<TranscriptSegment[]> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new Error("ASSEMBLYAI_API_KEY is required");
  }

  if (!audioBuffer || audioBuffer.length < 1000) {
    throw new Error("El audio está vacío o es muy corto. Grabá al menos unos segundos.");
  }

  const client = new AssemblyAI({ apiKey });
  const speakerLabels = useSpeakerLabels();
  const transcribeOptions = { pollingInterval: parsePollingIntervalMs() };

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transcript = await client.transcripts.transcribe(
        {
          audio: audioBuffer,
          speech_models: ["universal-2"],
          speaker_labels: speakerLabels,
          language_code: "es",
          ...(speakerLabels ? { speakers_expected: 2 } : {}),
        },
        transcribeOptions
      );

      if (transcript.status === "error") {
        throw new Error(transcript.error ?? "Transcription failed");
      }

      if (!transcript.utterances?.length) {
        return segmentsFromPlainText(transcript);
      }

      const speakerMap = new Map<string, TranscriptSegment["speaker"]>();
      const segments: TranscriptSegment[] = transcript.utterances.map((u) => ({
        speaker: mapSpeaker(u.speaker, u.text, speakerMap),
        timestampStart: Math.round(u.start / 1000),
        timestampEnd: Math.round(u.end / 1000),
        text: u.text.trim(),
        confidence: u.confidence,
        lowConfidence: (u.confidence ?? 1) < 0.7,
      }));

      return postProcess(segments);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isUploadError = lastError.message.toLowerCase().includes("upload");
      if (isUploadError && attempt < maxRetries) {
        await sleep(2000 * attempt);
      } else {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Transcription failed");
}

function mapSpeaker(
  assemblySpeaker: string,
  text: string,
  speakerMap: Map<string, TranscriptSegment["speaker"]>
): TranscriptSegment["speaker"] {
  if (isLikelyMedico(text)) {
    speakerMap.set(assemblySpeaker, "medico");
    return "medico";
  }
  if (isLikelyPaciente(text)) {
    speakerMap.set(assemblySpeaker, "paciente");
    return "paciente";
  }
  const mapped = speakerMap.get(assemblySpeaker);
  if (mapped) return mapped;
  const defaultRole = assemblySpeaker === "A" ? "medico" : "paciente";
  speakerMap.set(assemblySpeaker, defaultRole);
  return defaultRole;
}

function postProcess(segments: TranscriptSegment[]): TranscriptSegment[] {
  let currentRole: TranscriptSegment["speaker"] = "medico";
  const result: TranscriptSegment[] = [];

  for (const seg of segments) {
    let text = seg.text;

    text = FILLERS.reduce((acc, filler) => {
      const re = new RegExp(`\\b${filler}\\b,?\\s*`, "gi");
      return acc.replace(re, " ").trim();
    }, text);

    text = text.replace(/\s+/g, " ").trim();
    if (!text) continue;

    let speaker = seg.speaker;
    if (speaker === "medico" || speaker === "paciente") {
      currentRole = speaker;
    } else {
      speaker = currentRole;
    }

    result.push({
      ...seg,
      text,
      speaker: speaker as TranscriptSegment["speaker"],
    });
  }

  return result;
}

export async function processAudio(audioBuffer: Buffer): Promise<TranscriptSegment[]> {
  const preprocessed = await preprocessAudio(audioBuffer);
  return transcribe(preprocessed);
}
