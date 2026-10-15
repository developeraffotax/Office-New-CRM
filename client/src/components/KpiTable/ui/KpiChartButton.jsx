import { IconButton, Tooltip } from "@mui/material";
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import { useNavigate } from "react-router-dom";

const KpiChartButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="KPI Chart" arrow>
      <IconButton
        onClick={() => navigate("/kpi-dashboard")}
        aria-label="Open KPI Chart"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          color: "primary.main",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
            borderColor: "primary.main",
          },
        }}
      >
        <StackedBarChartIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default KpiChartButton;