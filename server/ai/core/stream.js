// ai/core/stream.js
// Server-Sent Events helper. POST + auth means the client uses fetch() + ReadableStream,
// not EventSource. Exclude this route from compression() or tokens will be buffered.

export function initSSE(res) {
  res.status(200).set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // nginx: don't buffer
  });
  res.flushHeaders?.();

  const controller = new AbortController();
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 15_000);

  // Client closed the tab / hit stop → cancel the upstream LLM call too.
  res.on("close", () => {
    clearInterval(heartbeat);
    controller.abort();
  });

  return {
    signal: controller.signal,
    send(event, data) {
      if (res.writableEnded) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      res.flush?.();
    },
    end() {
      clearInterval(heartbeat);
      if (!res.writableEnded) res.end();
    },
  };
}
