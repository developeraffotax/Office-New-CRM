import axios from "axios";

const BASE = `${process.env.REACT_APP_API_URL}/api/v1/kpi-table`;

/** -> { success, filters, columns, rows } */
export const fetchKpiTable = async (params, signal) => {
  const { data } = await axios.get(BASE, { params, signal });
  return data;
};

/** -> { success, rows: [{ key, label, format }] } */
export const fetchKpiTableRows = async () => {
  const { data } = await axios.get(`${BASE}/rows`);
  return data;
};

/** Downloads the .xlsx for the given filters (+ `rows` = comma-separated selected row keys). */
export const downloadKpiTableExport = async (params) => {
  const { data } = await axios.get(`${BASE}/export`, { params, responseType: "blob" });

  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `sales-kpi_${params.start?.slice(0, 10)}_${params.end?.slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};