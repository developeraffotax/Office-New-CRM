// MCP server over the existing read-only CRM tools (ai/agent/tools/crm.js).
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import Ajv from "ajv";
import { crmTools } from "../agent/tools/crm.js";
import { ToolError, withTimeout } from "../agent/toolkit.js";

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
const TOOL_TIMEOUT_MS = 20_000;
const MAX_TOOL_CHARS = 12_000;
const validators = new Map(crmTools.map((t) => [t.name, ajv.compile(t.parameters)]));

const INSTRUCTIONS = `Read-only CRM tools for people, tasks, jobs (client records), leads and tickets.
Call find_user to turn a person's name into a userId before any other tool that takes one.
"as" means assignee (the job holder) unless the question is about the team lead — then use lead, or either.
Use get_*_stats for "how many" and list_* for "which ones".
These tools never change data and never return logins, passwords or tax codes.`;

export function createCrmMcpServer(user) {
  const server = new Server(
    { name: "office-crm", version: "1.0.0" },
    { capabilities: { tools: {} }, instructions: INSTRUCTIONS }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: crmTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.parameters,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const tool = crmTools.find((t) => t.name === name);
    if (!tool) {
      return { content: [{ type: "text", text: `Unknown tool "${name}".` }], isError: true };
    }

    const input = structuredClone(request.params.arguments ?? {});
    const validate = validators.get(name);
    if (!validate(input)) {
      return {
        content: [{ type: "text", text: `Invalid arguments: ${ajv.errorsText(validate.errors)}` }],
        isError: true,
      };
    }

    try {
      const out = await withTimeout(tool.execute(input, { user }), TOOL_TIMEOUT_MS, name);
      let text = JSON.stringify(out ?? null);
      if (text.length > MAX_TOOL_CHARS) text = `${text.slice(0, MAX_TOOL_CHARS)} …[truncated]`;
      return { content: [{ type: "text", text }] };
    } catch (err) {
      if (err instanceof ToolError) {
        return { content: [{ type: "text", text: err.message }], isError: true };
      }
      console.error(`[mcp] tool ${name} failed:`, err);
      return { content: [{ type: "text", text: "The tool failed unexpectedly." }], isError: true };
    }
  });

  return server;
}
