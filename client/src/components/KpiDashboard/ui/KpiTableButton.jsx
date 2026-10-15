import { IconButton, Tooltip } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useNavigate } from "react-router-dom";

const KpiTableButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="KPI Table" arrow>
      <IconButton
        onClick={() => navigate("/kpi-table")}
        aria-label="Open KPI Table"
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
        <TableChartIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default KpiTableButton;