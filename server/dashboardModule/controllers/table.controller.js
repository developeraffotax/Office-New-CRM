import ExcelJS from "exceljs";
import { buildKpiTable } from "../services/kpiTable.service.js";
import { parseDateRange } from "../utils/chartHelpers.js";

const handleError = (res, error) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error fetching KPI table",
  });
};

/** GET /kpi-table?start=&end=&source=&jobHolder=a,b&rows=sales,leadsWon */
export const getKpiTable = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { columns, rows } = await buildKpiTable({ start, end, query: req.query });
    res.status(200).json({ success: true, filters: { start, end }, columns, rows });
  } catch (error) {
    handleError(res, error);
  }
};

const NUM_FMT = {
  number: "#,##0",
  currency: '"£"#,##0.00',
  percent: '0.00"%"',
};

/** GET /kpi-table/export  (same query as above; ?rows= limits it to the selected rows) */
export const exportKpiTable = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { columns, rows } = await buildKpiTable({ start, end, query: req.query });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Sales KPI", {
      views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
    });

    ws.columns = [
      { header: "Sales KPI", key: "label", width: 32 },
      ...columns.map((c, i) => ({ header: c, key: `c${i}`, width: 16 })),
    ];

    const totalColIdx = columns.length + 1; // label is col 1, Team Total is last

    rows.forEach((r) => {
      const row = ws.addRow({
        label: r.label,
        ...Object.fromEntries(r.values.map((v, i) => [`c${i}`, v])), // null -> empty cell
      });
      r.values.forEach((_, i) => {
        const cell = row.getCell(i + 2);
        cell.numFmt = NUM_FMT[r.format] || NUM_FMT.number;
        cell.alignment = { horizontal: "right" };
      });
      row.getCell(totalColIdx).font = { bold: true };
      row.getCell(totalColIdx).fill = {
        type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" },
      };
    });

    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };
    header.alignment = { horizontal: "center", vertical: "middle" };
    header.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

    const day = (d) => new Date(d).toISOString().slice(0, 10);
    const filename = `sales-kpi_${day(start)}_${day(end)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    handleError(res, error);
  }
};