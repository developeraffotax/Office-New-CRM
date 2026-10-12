import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { fetchKpiTable, downloadKpiTableExport } from "../api/kpiTableApi";

const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

const formatValue = (v, format) => {
  if (v === null || v === undefined) return "–";
  if (format === "currency") return gbp.format(v);
  if (format === "percent") return `${nf.format(v)}%`;
  return nf.format(v);
};

const CHECK_W = 52;
const LABEL_W = 240;

export default function KpiTable({ dateRange, source, users }) {
  const [table, setTable] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  // We store what is UNchecked, so every row (including KPIs you add later)
  // is selected by default.
  const [deselected, setDeselected] = useState(() => new Set());

  const startISO = dateRange?.[0]?.toISOString();
  const endISO = dateRange?.[1]?.toISOString();
  const usersKey = users.join(",");

  // Param names must match what ChartPanel sends to the chart endpoints.
  const params = useMemo(
    () => ({
      start: startISO,
      end: endISO,
      ...(source ? { source } : {}),
      ...(usersKey ? { jobHolder: usersKey } : {}),
    }),
    [startISO, endISO, source, usersKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchKpiTable(params, controller.signal);
        setTable({ columns: data.columns || [], rows: data.rows || [] });
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err?.response?.data?.message || "Failed to load KPI table");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [params]);

  const selectedKeys = table.rows
    .filter((r) => !deselected.has(r.key))
    .map((r) => r.key);
  const allSelected = table.rows.length > 0 && selectedKeys.length === table.rows.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  const toggleRow = (key) =>
    setDeselected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleAll = () =>
    setDeselected(allSelected ? new Set(table.rows.map((r) => r.key)) : new Set());

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadKpiTableExport({ ...params, rows: selectedKeys.join(",") });
    } catch (err) {
      setError("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const lastIdx = table.columns.length - 1; // "Team Total"

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {selectedKeys.length} of {table.rows.length} rows selected
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<FileDownloadIcon />}
          disabled={exporting || loading || selectedKeys.length === 0}
          onClick={handleExport}
        >
          {exporting ? "Exporting…" : "Export to Excel"}
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <LinearProgress />}

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "70vh" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{ position: "sticky", left: 0, zIndex: 3, minWidth: CHECK_W }}
              >
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  left: CHECK_W,
                  zIndex: 3,
                  minWidth: LABEL_W,
                  fontWeight: 700,
                }}
              >
                Sales KPI
              </TableCell>
              {table.columns.map((col, i) => (
                <TableCell
                  key={col}
                  align="right"
                  sx={{
                    fontWeight: 700,
                    minWidth: 120,
                    ...(i === lastIdx && { backgroundColor: "#F3F4F6" }),
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {table.rows.map((row) => {
              const checked = !deselected.has(row.key);
              return (
                <TableRow key={row.key} hover selected={checked}>
                  <TableCell
                    padding="checkbox"
                    sx={{ position: "sticky", left: 0, zIndex: 1, background: "#fff" }}
                  >
                    <Checkbox size="small" checked={checked} onChange={() => toggleRow(row.key)} />
                  </TableCell>
                  <TableCell
                    sx={{ position: "sticky", left: CHECK_W, zIndex: 1, background: "#fff" }}
                  >
                    {row.label}
                  </TableCell>
                  {row.values.map((v, i) => (
                    <TableCell
                      key={i}
                      align="right"
                      sx={{
                        ...(i === lastIdx && { fontWeight: 700, backgroundColor: "#F9FAFB" }),
                        ...(row.heat === "achievement" &&
                          typeof v === "number" && {
                            color: v >= 100 ? "success.main" : "warning.dark",
                            fontWeight: 600,
                          }),
                      }}
                    >
                      {formatValue(v, row.format)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}

            {!loading && table.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={table.columns.length + 2}>
                  <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                    No data for this range.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}