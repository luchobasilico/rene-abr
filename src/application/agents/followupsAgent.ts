import type { SOAPNote, TranscriptSegment } from "@shared-types";
import { generateFollowupsActions } from "@services/ai-orchestrator";
import { postProcessFollowups } from "./actionPostProcessing";

export async function runFollowupsAgent(
  segments: TranscriptSegment[],
  soap: SOAPNote
): Promise<string[]> {
  const raw = await generateFollowupsActions(segments, soap);
  return postProcessFollowups(raw);
}
