import test from "node:test";
import assert from "node:assert/strict";
import { runAgent } from "./runAgent";

test("runAgent retorna ok cuando la ejecución resulta bien", async () => {
  const result = await runAgent({
    agentId: "ok-agent",
    timeoutMs: 500,
    retries: 1,
    fallback: () => "fallback",
    run: async () => "success",
  });

  assert.equal(result.ok, true);
  assert.equal(result.output, "success");
  assert.equal(result.meta.fallbackUsed, false);
});

test("runAgent reintenta y luego usa fallback", async () => {
  let attempts = 0;
  const result = await runAgent({
    agentId: "retry-agent",
    timeoutMs: 500,
    retries: 2,
    fallback: () => "fallback-value",
    run: async () => {
      attempts += 1;
      throw new Error("boom");
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.output, "fallback-value");
  assert.equal(result.meta.fallbackUsed, true);
  assert.equal(attempts, 3);
});

test("runAgent respeta timeout y aplica fallback", async () => {
  const result = await runAgent({
    agentId: "timeout-agent",
    timeoutMs: 20,
    retries: 0,
    fallback: () => "timeout-fallback",
    run: () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("late"), 80);
      }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.output, "timeout-fallback");
  assert.equal(result.meta.fallbackUsed, true);
  assert.match(result.error ?? "", /timeout/i);
});
