interface StageLogPayload {
  visitId?: string;
  stage: string;
  status: "start" | "end" | "error";
  durationMs?: number;
  error?: string;
}

function logStage(payload: StageLogPayload) {
  const base = `[pipeline] visit=${payload.visitId ?? "unknown"} stage=${payload.stage} status=${payload.status}`;
  if (payload.status === "end") {
    console.info(`${base} durationMs=${payload.durationMs ?? 0}`);
    return;
  }
  if (payload.status === "error") {
    console.error(`${base} durationMs=${payload.durationMs ?? 0} error=${payload.error ?? "unknown"}`);
    return;
  }
  console.info(base);
}

export async function traceStage<T>(
  stage: string,
  visitId: string | undefined,
  run: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  logStage({ visitId, stage, status: "start" });
  try {
    const result = await run();
    logStage({
      visitId,
      stage,
      status: "end",
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    logStage({
      visitId,
      stage,
      status: "error",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
