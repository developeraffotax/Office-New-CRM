// Labels shown while the agent runs a tool. Unknown tools fall back to a readable name.
export const TOOL_LABELS = {
  search_knowledge: "Searching the knowledge base",
  list_datasets: "Looking up spreadsheets",
  describe_dataset: "Reading spreadsheet columns",
  query_dataset: "Searching a spreadsheet",
  aggregate_dataset: "Calculating totals",
  get_form_schema: "Reading the form",
  propose_form_fill: "Filling in the form",
  find_user: "Finding the person",
  get_task_stats: "Counting tasks",
  list_tasks: "Looking up tasks",
  get_job_stats: "Counting jobs",
  list_jobs: "Looking up jobs",
  get_lead_stats: "Counting leads",
  list_leads: "Looking up leads",
  get_ticket_stats: "Counting tickets",
  list_tickets: "Looking up tickets",
  read_attachment: "Reading the file",
  fill_sheet_from_dataset: "Filling the spreadsheet",
  write_sheet_cells: "Writing to the spreadsheet",
};

export const toolLabel = (n) => TOOL_LABELS[n] || n.replaceAll("_", " ");

export const DEFAULT_SUGGESTIONS = [
  "What's our process for onboarding a new client?",
  "Which spreadsheets can you look things up in?",
];

export const ACCEPTED_FILES = ".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,.json,.png,.jpg,.jpeg,.webp,.gif";