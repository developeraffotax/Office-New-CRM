export const getTemplateBodyText = (tpl) =>
  tpl.components?.find((c) => c.type === "BODY")?.text || "";

// {{1}}, {{2}}... -> how many variable slots exist (handles repeats/out-of-order)
export const getTemplateVariableCount = (tpl) => {
  const matches = [...getTemplateBodyText(tpl).matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
  return matches.length ? Math.max(...matches) : 0;
};

// fills {{1}}, {{2}}... with the values you've collected, for a live preview
export const interpolateTemplate = (text, values) =>
  text.replace(/\{\{(\d+)\}\}/g, (_, n) => values[Number(n) - 1] || `{{${n}}}`);