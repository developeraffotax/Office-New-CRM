import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ToggleStatsButton({ showStats, onToggle }) {
  // If you are managing state internally, use this:
  // const [showStats, setShowStats] = useState(true);
  // const onToggle = () => setShowStats(!showStats);

  return (
    
      <IconButton
        onClick={onToggle}
        color="default"
        size="medium"
        aria-label="toggle stats"
        sx={{
          backgroundColor: "rgba(15, 23, 42, 0.04)",
          "&:hover": { backgroundColor: "rgba(15, 23, 42, 0.08)" },
        }}
      >
        {showStats ? (
          <VisibilityOff  sx={{ color: "#64748B" }} />
        ) : (
          <Visibility   sx={{ color: "#64748B" }} />
        )}
      </IconButton>
 
  );
}