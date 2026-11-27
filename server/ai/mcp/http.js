// Remote MCP server (Streamable HTTP), stateless: one admin check per request.
//   POST http://127.0.0.1:8090/mcp
//   Authorization: Bearer <CRM JWT>   or   Bearer <MCP_API_KEY> (then MCP_USER_ID is the admin)
//   npm run mcp:http
import "./env.js";
import express from "express";
import mongoose from "mongoose";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { bootCrm } from "./bootstrap.js";
import { userFromHttp } from "./auth.js";
import { createCrmMcpServer } from "./createServer.js";

function rpcError(res, status, message) {
  res.status(status).json({
    jsonrpc: "2.0",
    error: { code: status === 401 ? -32001 : -32000, message },
    id: null,
  });
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "office-crm" });
});

app.post("/mcp", async (req, res) => {
  let user;
  try {
    user = await userFromHttp(req);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error("[mcp] auth:", err);
    return rpcError(res, status, err.message || "Unauthorized");
  }

  const server = createCrmMcpServer(user);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[mcp] request failed:", err);
    if (!res.headersSent) rpcError(res, 500, "MCP request failed.");
  }
});

app.get("/mcp", (_req, res) => rpcError(res, 405, "Method not allowed."));
app.delete("/mcp", (_req, res) => rpcError(res, 405, "Method not allowed."));

await bootCrm();

const port = Number(process.env.MCP_PORT || 8090);
const host = process.env.MCP_HOST || "127.0.0.1";
const httpServer = app.listen(port, host, () => {
  console.log(`[mcp] HTTP ready at http://${host}:${port}/mcp`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    httpServer.close();
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
}
