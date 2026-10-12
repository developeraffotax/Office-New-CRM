// utils/userColors.js
const USER_COLOR_PALETTE = [
  "#1461de", "#059669", "#DB2777", "#6366F1",
  "#EA580C", "#0891B2", "#7C3AED", "#CA8A04",
  "#DC2626", "#16A34A", "#2563EB", "#0D9488",
];

const hashToIndex = (str, mod) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % mod;
};

export const getUserColor = (name) => USER_COLOR_PALETTE[hashToIndex(name, USER_COLOR_PALETTE.length)];



export const colorsForSeries = (series, fallback = USER_COLOR_PALETTE) =>
  series.length > 1
    ? series.map((s) => fallback[hashToIndex(s.name, fallback.length)])
    : fallback; // single series: keep original palette order/behavior