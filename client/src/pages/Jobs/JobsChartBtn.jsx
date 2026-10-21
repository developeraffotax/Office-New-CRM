import { IconButton, Tooltip } from "@mui/material";
import AdsClickIcon from '@mui/icons-material/AdsClick';
import { useNavigate } from "react-router-dom";

const JobsChartBtn = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="Jobs KPI Chart" arrow>
      <IconButton
        onClick={() => navigate("/jobs-targets")}
        aria-label="Open Jobs KPI Chart"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          color: "text.secondary",          // soft gray icon
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
            borderColor: "text.secondary",
            color: "text.primary",
          },
        }}
      >
        <AdsClickIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default JobsChartBtn;