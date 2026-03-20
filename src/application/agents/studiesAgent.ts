import type { ExtractedStudy, SOAPNote, TranscriptSegment } from "@shared-types";
import { generateStudiesActions } from "@services/ai-orchestrator";
import { postProcessStudies } from "./actionPostProcessing";

export async function runStudiesAgent(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<ExtractedStudy[]> {
  const raw = await generateStudiesActions(segments, soap);
  return postProcessStudies(raw);
}
