export const ACCEPT = ".pdf,.docx,.txt,.md,.csv,.xlsx";

// [label, badge classes] per document status.
export const STATUS = {
  queued: ["Queued", "bg-gray-100 text-gray-600 ring-gray-200"],
  processing: ["Processing", "bg-blue-50 text-blue-700 ring-blue-200"],
  ready: ["Ready", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
  failed: ["Failed", "bg-red-50 text-red-700 ring-red-200"],
};
