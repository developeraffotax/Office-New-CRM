import { Box, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function ChangeLabel({ percent, dateRange }) {
  const value = Number(percent) || 0;
  const isPositive = value >= 0;

  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {isPositive ? (
        <ArrowUpwardIcon sx={{ fontSize: 14, color: "success.main" }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: 14, color: "error.main" }} />
      )}
      <Typography
        component="span"
        variant="body2"
        sx={{ color: isPositive ? "success.main" : "error.main", fontWeight: 600 }}
      >
        {Math.abs(value).toFixed(1)}%
      </Typography>
      {dateRange && (
        <Typography component="span" variant="caption" color="text.secondary">
          vs. prior
        </Typography>
      )}
    </Box>
  );
}