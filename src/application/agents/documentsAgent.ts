import type { ExtractedDocument, SOAPNote, TranscriptSegment } from "@shared-types";
import { generateDocumentsActions } from "@services/ai-orchestrator";
import { postProcessDocuments } from "./actionPostProcessing";

export async function runDocumentsAgent(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<ExtractedDocument[]> {
  const raw = await generateDocumentsActions(segments, soap);
  return postProcessDocuments(raw);
}
