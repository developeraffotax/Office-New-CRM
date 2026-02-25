

export function normalizeDashes(text = "") {
  return text.replace(/[\u2012\u2013\u2014\u2015\u2212]/g, "-");
}