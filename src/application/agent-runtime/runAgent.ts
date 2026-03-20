import type { AgentResult } from "@shared-types";
import type { AgentRuntimeOptions, AgentRuntimeRunner } from "./types";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, agentId: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Agent timeout: ${agentId}`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export const runAgent: AgentRuntimeRunner = async <TOutput>({
  agentId,
  timeoutMs,
  retries = 0,
  fallback,
  run,
}: AgentRuntimeOptions<TOutput>): Promise<AgentResult<TOutput>> => {
  const startedAt = Date.now();
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const output = await withTimeout(run(), timeoutMs, agentId);
      return {
        ok: true,
        output,
        meta: {
          agentId,
          retries: attempt,
          timeoutMs,
          fallbackUsed: false,
          durationMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > retries) break;
    }
  }

  return {
    ok: false,
    output: fallback(),
    error: lastError instanceof Error ? lastError.message : String(lastError),
    meta: {
      agentId,
      retries,
      timeoutMs,
      fallbackUsed: true,
      durationMs: Date.now() - startedAt,
    },
  };
};
