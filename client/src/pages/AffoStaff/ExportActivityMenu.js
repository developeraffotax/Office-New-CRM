import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const REPORT_TYPES = [
  { value: "day", label: "Daily Report" },
  { value: "week", label: "Weekly Report" },
  { value: "month", label: "Monthly Report" },
 
  { value: "team-week", label: "Team Report (All Users)" },
];

// `defaultUserId` pre-fills the dialog's user picker with whatever the dashboard
// currently has selected, but the user can change it before exporting.
// `canExportTeamReport` hides the team-week option for users who shouldn't see it.
export default function ExportActivityMenu({ users, defaultUserId, canExportTeamReport = true }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [dialogType, setDialogType] = useState(null); // "day" | "week" | "month" | "team-week" | null
  const [isExporting, setIsExporting] = useState(false);

  const [exportUserId, setExportUserId] = useState(defaultUserId || "");
  const [exportDate, setExportDate] = useState(dayjs());
  const [exportStart, setExportStart] = useState(dayjs().startOf("week"));
  const [exportEnd, setExportEnd] = useState(dayjs().endOf("week"));
  const [teamLayout, setTeamLayout] = useState("grid"); // "grid" | "blocks"

  const openMenu = (e) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const selectReportType = (type) => {
    closeMenu();
    setExportUserId(defaultUserId || "");
    setExportDate(dayjs());
    setTeamLayout("grid");
    if (type === "week" || type === "team-week") {
      setExportStart(dayjs().startOf("week"));
      setExportEnd(dayjs().endOf("week"));
    } else if (type === "month") {
      setExportStart(dayjs().startOf("month"));
      setExportEnd(dayjs().endOf("month"));
    }
    setDialogType(type);
  };

  const closeDialog = () => {
    if (isExporting) return;
    setDialogType(null);
  };

  const applyMonthPreset = (preset) => {
    const today = dayjs();
    switch (preset) {
      case "thisMonth":
        setExportStart(today.startOf("month"));
        setExportEnd(today.endOf("month"));
        break;
      case "lastMonth": {
        const lastMonth = today.subtract(1, "month");
        setExportStart(lastMonth.startOf("month"));
        setExportEnd(lastMonth.endOf("month"));
        break;
      }
      case "lastQuarter":
        setExportStart(today.subtract(3, "month").startOf("month"));
        setExportEnd(today.endOf("day"));
        break;
      case "thisYear":
        setExportStart(today.startOf("year"));
        setExportEnd(today.endOf("day"));
        break;
      default:
        break;
    }
  };

  const applyWeekPreset = (preset) => {
    const today = dayjs();
    if (preset === "thisWeek") {
      setExportStart(today.startOf("week"));
      setExportEnd(today.endOf("week"));
    } else if (preset === "lastWeek") {
      const lastWeek = today.subtract(1, "week");
      setExportStart(lastWeek.startOf("week"));
      setExportEnd(lastWeek.endOf("week"));
    }
  };

  const downloadBlobResponse = (response) => {
    const disposition = response.headers["content-disposition"];
    const match = disposition?.match(/filename="([^"]+)"/);
    const filename = match?.[1] || "Activity_Report.xlsx";

    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const reportErrorToast = async (err) => {
    try {
      if (err.response?.data instanceof Blob && err.response.data.type.includes("application/json")) {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        toast.error(json.message || "Failed to export activity report.");
      } else {
        toast.error(err.message || "Failed to export activity report.");
      }
    } catch {
      toast.error("Failed to export activity report.");
    }
  };

  const handleExport = async () => {
    if (isExporting) return;

    if (dialogType !== "team-week" && !exportUserId) {
      toast.error("Please select a user.");
      return;
    }

    setIsExporting(true);
    try {
      let url;
      let params;

      if (dialogType === "day") {
        url = `${process.env.REACT_APP_API_URL}/api/v1/agent/export-activity/${exportUserId}`;
        params = { reportType: "day", date: exportDate.format("YYYY-MM-DD") };
      } else if (dialogType === "week") {
        url = `${process.env.REACT_APP_API_URL}/api/v1/agent/export-activity/${exportUserId}`;
        params = {
          reportType: "week",
          startDate: exportStart.format("YYYY-MM-DD"),
          endDate: exportEnd.format("YYYY-MM-DD"),
        };
      } else if (dialogType === "month") {
        url = `${process.env.REACT_APP_API_URL}/api/v1/agent/export-activity/${exportUserId}`;
        params = {
          reportType: "month",
          startDate: exportStart.format("YYYY-MM-DD"),
          endDate: exportEnd.format("YYYY-MM-DD"),
        };
      } else if (dialogType === "team-week") {
        url = `${process.env.REACT_APP_API_URL}/api/v1/agent/export-activity/team/weekly`;
        params = {
          reportType: "team-week",
          layout: teamLayout,
          startDate: exportStart.format("YYYY-MM-DD"),
          endDate: exportEnd.format("YYYY-MM-DD"),
        };
      }

      const response = await axios.get(url, { params, responseType: "blob" });
      downloadBlobResponse(response);
      setDialogType(null);
    } catch (err) {
      await reportErrorToast(err);
    } finally {
      setIsExporting(false);
    }
  };

  const visibleReportTypes = canExportTeamReport
    ? REPORT_TYPES
    : REPORT_TYPES.filter((r) => r.value !== "team-week");

  const dialogLabel = REPORT_TYPES.find((r) => r.value === dialogType)?.label || "Export Report";

return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <button
        onClick={openMenu}
        className="group flex items-center justify-center px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-sm font-medium rounded-xl border border-neutral-200 hover:border-neutral-300 shadow-sm transition-all duration-200 ease-in-out outline-none"
      >
        <svg
          className="mr-2 text-neutral-400 group-hover:text-neutral-600 transform group-hover:translate-y-0.5 transition-transform duration-200 ease-in-out"
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export</span>
      </button>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        {visibleReportTypes.map((r) => (
          <MenuItem key={r.value} onClick={() => selectReportType(r.value)}>
            {r.label}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={Boolean(dialogType)} onClose={closeDialog} fullWidth maxWidth="xs" scroll="paper">
        {isExporting ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", py: 7, px: 4, gap: 2.5 }}>
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={58} thickness={4} sx={{ color: "neutral.900" }} />
              <Box sx={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg className="w-5 h-5 text-neutral-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "neutral.900", mt: 1 }}>
              Generating Your Report
            </Typography>
            <Typography variant="body2" sx={{ color: "neutral.500", maxWidth: 280, lineHeight: 1.5 }}>
              We are assembling your requested spreadsheet information. This will only take a brief moment.
            </Typography>
          </Box>
        ) : (
          <>
            <DialogTitle>{dialogLabel}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              {dialogType !== "team-week" && (
                <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                  <InputLabel>User</InputLabel>
                  <Select value={exportUserId} label="User" onChange={(e) => setExportUserId(e.target.value)}>
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name || u.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {dialogType === "day" && (
                <DatePicker
                  label="Date"
                  value={exportDate}
                  onChange={(v) => v && setExportDate(v)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              )}

              {dialogType === "team-week" && (
                <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Layout</InputLabel>
                  <Select value={teamLayout} label="Layout" onChange={(e) => setTeamLayout(e.target.value)}>
                    <MenuItem value="grid">Grid — days as rows, users as columns</MenuItem>
                    <MenuItem value="blocks">Detailed — one block per user</MenuItem>
                  </Select>
                </FormControl>
              )}

              {(dialogType === "week" || dialogType === "team-week") && (
                <>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" onClick={() => applyWeekPreset("thisWeek")}>
                      This Week
                    </Button>
                    <Button size="small" onClick={() => applyWeekPreset("lastWeek")}>
                      Last Week
                    </Button>
                  </Box>
                  <DatePicker
                    label="Start Date"
                    value={exportStart}
                    onChange={(v) => v && setExportStart(v)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={exportEnd}
                    onChange={(v) => v && setExportEnd(v)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </>
              )}

              {dialogType === "month" && (
                <>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button size="small" onClick={() => applyMonthPreset("thisMonth")}>
                      This Month
                    </Button>
                    <Button size="small" onClick={() => applyMonthPreset("lastMonth")}>
                      Last Month
                    </Button>
                    <Button size="small" onClick={() => applyMonthPreset("lastQuarter")}>
                      Last Quarter
                    </Button>
                    <Button size="small" onClick={() => applyMonthPreset("thisYear")}>
                      This Year
                    </Button>
                  </Box>
                  <DatePicker
                    label="Start Date"
                    value={exportStart}
                    onChange={(v) => v && setExportStart(v)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={exportEnd}
                    onChange={(v) => v && setExportEnd(v)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ width: "100%", display: "flex", justifyContent: "space-between", px: 3, pb: 2 }}>
              <Button onClick={closeDialog} disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting} variant="contained">
                Export
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </LocalizationProvider>
  );
}