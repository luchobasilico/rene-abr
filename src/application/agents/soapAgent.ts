import type { SOAPNote, TranscriptSegment } from "@shared-types";
import { generateSOAPBlock } from "@services/ai-orchestrator";

export interface RunSoapAgentInput {
  segments: TranscriptSegment[];
  onBlockGenerated?: (block: keyof SOAPNote, soap: SOAPNote) => Promise<void> | void;
}

export async function runSoapAgent({ segments, onBlockGenerated }: RunSoapAgentInput): Promise<SOAPNote> {
  const soap: SOAPNote = {
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  };
  const blocks: Array<keyof SOAPNote> = ["subjective", "objective", "assessment", "plan"];

  for (const block of blocks) {
    const text = await generateSOAPBlock(segments, block, soap);
    soap[block] = text;
    await onBlockGenerated?.(block, soap);
  }

  return soap;
}
