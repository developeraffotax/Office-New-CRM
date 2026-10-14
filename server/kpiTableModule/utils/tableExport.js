import ExcelJS from "exceljs";

const NUM_FMT = {
  number: "#,##0",
  currency: '"£"#,##0.00',
  percent: '0.00"%"',
};

const day = (d) => new Date(d).toISOString().slice(0, 10);

export const kpiExportFilename = (start, end) => `sales-kpi_${day(start)}_${day(end)}.xlsx`;

const solid = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const argb = (hex) => `FF${hex.replace("#", "").toUpperCase()}`; // "#6366F1" -> "FF6366F1"

/**
 * { columns, rows } (from buildKpiTable) -> ExcelJS workbook.
 * Cells stay numeric, null stays blank. When a row's `group` changes, a merged,
 * shaded group header row is inserted above it (only for groups that have rows).
 */
export const buildKpiWorkbook = ({ columns, rows }) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sales KPI", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
  });

  ws.columns = [
    { header: "Sales KPI", key: "label", width: 32 },
    ...columns.map((c, i) => ({ header: c, key: `c${i}`, width: 16 })),
  ];

  const lastCol = columns.length + 1; // label is col 1, Team Total is the last column
  let currentGroup = null;

  rows.forEach((r) => {
    // --- group divider row ---
    if (r.group && r.group !== currentGroup) {
      currentGroup = r.group;
      const band = ws.addRow([r.groupLabel || r.group]);
      ws.mergeCells(band.number, 1, band.number, lastCol);
      band.height = 20;
      const cell = band.getCell(1);
      cell.value = r.groupLabel || r.group;
      const gc = r.groupColor;
      cell.font = { bold: true, color: { argb: gc ? argb(gc.text) : "FF374151" } };
      cell.fill = solid(gc ? argb(gc.bg) : "FFE5E7EB");
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      cell.border = {
        top: { style: "medium", color: { argb: gc ? argb(gc.accent) : "FF9CA3AF" } },
        left: { style: "thick", color: { argb: gc ? argb(gc.accent) : "FF9CA3AF" } },
      };
    }

    // --- data row ---
    const row = ws.addRow({
      label: r.label,
      ...Object.fromEntries(r.values.map((v, i) => [`c${i}`, v])),
    });
    row.getCell(1).alignment = { indent: 1 };
    if (r.groupColor) {
      // coloured stripe down the left edge of every row in the group
      row.getCell(1).border = { left: { style: "thick", color: { argb: argb(r.groupColor.accent) } } };
    }

    r.values.forEach((_, i) => {
      const cell = row.getCell(i + 2);
      cell.numFmt = NUM_FMT[r.format] || NUM_FMT.number;
      cell.alignment = { horizontal: "right" };
    });

    const total = row.getCell(lastCol);
    total.font = { bold: true };
    total.fill = solid("FFF3F4F6");
  });

  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = solid("FF1F2937");
  header.alignment = { horizontal: "center", vertical: "middle" };
  header.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

  return wb;
};