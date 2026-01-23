export const getHeader = (headers, name) =>
  headers.find(h => h.name === name)?.value || "";
