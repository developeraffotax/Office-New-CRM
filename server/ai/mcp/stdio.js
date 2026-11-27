// Local MCP server (stdio). Cursor / Claude Desktop spawn this process.
//   MCP_USER_ID must be an admin user's Mongo id.
//   npm run mcp
import "./env.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import mongoose from "mongoose";
import { bootCrm } from "./bootstrap.js";
import { userFromEnv } from "./auth.js";
import { createCrmMcpServer } from "./createServer.js";

console.log = (...args) => console.error(...args);

try {
  await bootCrm();
  const user = await userFromEnv();
  const server = createCrmMcpServer(user);
  await server.connect(new StdioServerTransport());
  console.error(`[mcp] stdio ready for ${user.email} (${user.role})`);
} catch (err) {
  console.error("[mcp] failed to start:", err.message || err);
  process.exit(1);
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
}
