import { prisma } from "@/lib/prisma";
import type { IAgentDecisionRepository } from "../src/domain/repositories";

export function createAgentDecisionRepository(): IAgentDecisionRepository {
  return {
    async createMany({ visitId, decisions }) {
      if (!decisions.length) return;
      await prisma.agentDecision.createMany({
        data: decisions.map((d) => ({
          visitId,
          agentKey: d.agentKey,
          activated: d.activated,
          reason: d.reason,
          matchedPattern: d.matchedPattern,
          source: d.source,
        })),
      });
    },
  };
}
