import type { AgentResult } from "@shared-types";

export interface AgentRuntimeOptions<TOutput> {
  agentId: string;
  timeoutMs: number;
  retries?: number;
  fallback: () => TOutput;
  run: () => Promise<TOutput>;
}

export type AgentRuntimeRunner = <TOutput>(
  options: AgentRuntimeOptions<TOutput>
) => Promise<AgentResult<TOutput>>;
