// ai/agent/profiles.js — one runtime, different profiles. Tools are filtered BEFORE the model sees them.
import { isAdminRole } from "../config.js";
import { EMPLOYEE_SYSTEM, ADMIN_SYSTEM } from "../core/prompts.js";

export const PROFILES = {
  employee: {
    name: "employee",
    tier: "fast", // cheapest/fastest model
    maxSteps: 4,
    maxTokens: 900,
    system: EMPLOYEE_SYSTEM,
    tools: ["search_knowledge", "list_datasets", "describe_dataset", "query_dataset", "aggregate_dataset", "get_form_schema", "propose_form_fill", "read_attachment", "fill_sheet_from_dataset", "write_sheet_cells"],
  },
  admin: {
    name: "admin",
    tier: "smart",
    maxSteps: 8,
    maxTokens: 1500,
    system: ADMIN_SYSTEM,
    tools: "*", // everything, including CRM tools and propose_* actions
  },
};

export const profileFor = (user) => (isAdminRole(user.role) ? PROFILES.admin : PROFILES.employee);
