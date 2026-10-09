import { alpha } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import { Box, Typography } from "@mui/material";


export const SummaryTile = ({
  label,
  value,
  icon,
  hint,
  progress,
  accent = "#6366F1",
  tinted = false,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: tinted ? alpha(accent, 0.28) : "#e5e7eb",
      bgcolor: tinted ? alpha(accent, 0.06) : "#fff",
      boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      transition: "box-shadow .2s ease, transform .2s ease",
      "&:hover": {
        boxShadow: "0 8px 20px rgba(16,24,40,0.08)",
        transform: "translateY(-1px)",
      },
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2.5,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        bgcolor: alpha(accent, 0.12),
        color: accent,
      }}
    >
      {icon}
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        noWrap
        sx={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.25,
          color: tinted ? accent : "text.primary",
        }}
      >
        {value}
      </Typography>

      {hint && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {hint}
        </Typography>
      )}

      {progress != null && (
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            mt: 0.75,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(accent, 0.12),
            "& .MuiLinearProgress-bar": { bgcolor: accent, borderRadius: 2 },
          }}
        />
      )}
    </Box>
  </Box>
);