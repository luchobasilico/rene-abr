import type { ExtractedMedication, SOAPNote, TranscriptSegment } from "@shared-types";
import { generateMedicationActions } from "@services/ai-orchestrator";
import { postProcessMedications } from "./actionPostProcessing";

export async function runMedicationAgent(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<ExtractedMedication[]> {
  const raw = await generateMedicationActions(segments, soap);
  return postProcessMedications(raw);
}
