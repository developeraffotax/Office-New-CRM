import { buildKpiTable, listKpiRows } from "../services/table.service.js";
import { buildKpiWorkbook, kpiExportFilename } from "../utils/tableExport.js";
import { parseDateRange } from "../utils/helpers.js";

const handleError = (res, error) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error fetching KPI table",
  });
};

/**
 * ONE place for access rules, used by both the table and the export.
 * Return the query the service should actually run.
 *
 * Example (adapt to your auth shape): non-admins only ever see themselves.
 *   if (!isAdminUser(req.user)) return { ...req.query, jobHolder: req.user.name };
 */
const scopeQuery = (req) => ({ ...req.query });

/** GET /api/v1/kpi-table?start=&end=&source=&jobHolder=a,b&rows=sales,leadsWon */
export const getKpiTable = async (req, res) => {
  try {
    const query = scopeQuery(req);
    const { start, end } = parseDateRange(query);
    const { columns, rows } = await buildKpiTable({ start, end, query });
    res.status(200).json({ success: true, filters: { start, end }, columns, rows });
  } catch (error) {
    handleError(res, error);
  }
};

/** GET /api/v1/kpi-table/rows  -> row definitions only (key, label, format) */
export const getKpiTableRows = (req, res) => {
  res.status(200).json({ success: true, rows: listKpiRows() });
};

/** GET /api/v1/kpi-table/export  (same query as the table; ?rows= limits it to the selected rows) */
export const exportKpiTable = async (req, res) => {
  try {
    const query = scopeQuery(req);
    const { start, end } = parseDateRange(query);
    const table = await buildKpiTable({ start, end, query });
    const wb = buildKpiWorkbook(table);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${kpiExportFilename(start, end)}"`,
    );
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    handleError(res, error);
  }
};