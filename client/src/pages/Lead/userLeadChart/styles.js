import { CHART_HEIGHT } from "./constants";

export const cardSx = {
  p: { xs: 1.5, md: 2 },
  bgcolor: "#FAFAFA",
  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
};

export const chartCardSx = {
  bgcolor: "#fff",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  p: { xs: 1.5, sm: 2 },
  "&:last-child": { pb: { xs: 1.5, sm: 2 } },
};

export const loadingSx = {
  width: "100%",
  height: CHART_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 500,
};

export const dividerSx = { mb: 2, borderColor: "rgba(15,23,42,0.06)" };
export const toolbarSx = { mb: 2 };
export const statsBoxSx = { maxWidth: { lg: "60%" }, minWidth: 0 };