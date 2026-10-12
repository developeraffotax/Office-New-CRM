import ExcelJS from "exceljs";

const NUM_FMT = {
  number: "#,##0",
  currency: '"£"#,##0.00',
  percent: '0.00"%"',
};

const day = (d) => new Date(d).toISOString().slice(0, 10);

export const kpiExportFilename = (start, end) => `sales-kpi_${day(start)}_${day(end)}.xlsx`;

/** { columns, rows } (from buildKpiTable) -> ExcelJS workbook. Cells stay numeric, null stays blank. */
export const buildKpiWorkbook = ({ columns, rows }) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sales KPI", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
  });

  ws.columns = [
    { header: "Sales KPI", key: "label", width: 32 },
    ...columns.map((c, i) => ({ header: c, key: `c${i}`, width: 16 })),
  ];

  const totalColIdx = columns.length + 1; // label is col 1, Team Total is the last column

  rows.forEach((r) => {
    const row = ws.addRow({
      label: r.label,
      ...Object.fromEntries(r.values.map((v, i) => [`c${i}`, v])),
    });

    r.values.forEach((_, i) => {
      const cell = row.getCell(i + 2);
      cell.numFmt = NUM_FMT[r.format] || NUM_FMT.number;
      cell.alignment = { horizontal: "right" };
    });

    const total = row.getCell(totalColIdx);
    total.font = { bold: true };
    total.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  });

  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };
  header.alignment = { horizontal: "center", vertical: "middle" };
  header.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

  return wb;
};