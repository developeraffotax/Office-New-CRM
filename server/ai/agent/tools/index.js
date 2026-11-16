// ai/agent/tools/index.js — the tool registry. Profiles decide which of these a person gets.
import { knowledgeTools } from "./knowledge.js";
import { datasetTools } from "./datasets.js";
import { crmTools } from "./crm.js";
import { formTools } from "./forms.js";
import { actionTools } from "./actions.js";
import { attachmentTools } from "./attachments.js";

// Each tool: { name, description, parameters (JSON Schema), execute(input, ctx) }
export const ALL_TOOLS = [...knowledgeTools, ...datasetTools, ...crmTools, ...formTools, ...attachmentTools, ...actionTools()];

export const toolsFor = (names) => (names === "*" ? ALL_TOOLS : ALL_TOOLS.filter((t) => names.includes(t.name)));
