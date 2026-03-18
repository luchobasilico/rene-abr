import { prisma } from "@/lib/prisma";
import type { TranscriptSegment } from "@shared-types";
import type { ITranscriptRepository, TranscriptEntity } from "../src/domain/repositories";

function mapSegment(seg: { speaker: string; timestampStart: number; timestampEnd: number; text: string; confidence: number | null; lowConfidence: boolean }): TranscriptSegment {
  return {
    speaker: seg.speaker as TranscriptSegment["speaker"],
    timestampStart: seg.timestampStart,
    timestampEnd: seg.timestampEnd,
    text: seg.text,
    confidence: seg.confidence ?? undefined,
    lowConfidence: seg.lowConfidence,
  };
}

export function createTranscriptRepository(): ITranscriptRepository {
  return {
    async create(data) {
      const transcript = await prisma.transcript.create({
        data: {
          visitId: data.visitId,
          audioUrl: data.audioUrl,
          segments: {
            create: data.segments.map((s) => ({
              speaker: s.speaker,
              timestampStart: s.timestampStart,
              timestampEnd: s.timestampEnd,
              text: s.text,
              confidence: s.confidence,
              lowConfidence: s.lowConfidence ?? false,
            })),
          },
        },
        include: { segments: true },
      });
      return {
        id: transcript.id,
        visitId: transcript.visitId,
        segments: transcript.segments.map(mapSegment),
        audioUrl: transcript.audioUrl ?? undefined,
      };
    },
    async findByVisitId(visitId) {
      const transcript = await prisma.transcript.findUnique({
        where: { visitId },
        include: { segments: true },
      });
      if (!transcript) return null;
      return {
        id: transcript.id,
        visitId: transcript.visitId,
        segments: transcript.segments.map(mapSegment),
        audioUrl: transcript.audioUrl ?? undefined,
      };
    },
  };
}
