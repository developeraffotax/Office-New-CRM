// ai/agent/toolkit.js — small helpers shared by every tool.

/** Errors whose message is safe to show the model. Anything else is logged and hidden. */
export class ToolError extends Error {}

export function withTimeout(promise, ms, label = "Tool") {
  let t;
  const timeout = new Promise((_, rej) => (t = setTimeout(() => rej(new ToolError(`${label} timed out.`)), ms)));
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}
