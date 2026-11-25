// Formats a changed cell value for the "What changed" list.
export const formatCell = (v) =>
  v == null || v === ""
    ? "empty"
    : v instanceof Date || /^\d{4}-\d{2}-\d{2}T/.test(String(v))
      ? String(v).slice(0, 10)
      : String(v);
