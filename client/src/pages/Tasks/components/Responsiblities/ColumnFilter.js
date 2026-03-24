import { useEffect } from "react";
export default function useColumnFilterSync(table, columnId, value, setValue) {
  useEffect(() => {
    if (!table) return;
    const col = table.getColumn(columnId);
    if (!col) return;

    const val = col.getFilterValue() || "";
    if (val !== value) setValue(val);
  }, [table, columnId, table.getState().columnFilters, value, setValue]);

  // For outside → table, just call this instead of another effect:
  const updateFilter = (val) => {
    table.getColumn(columnId)?.setFilterValue(val || undefined);
    setValue(val);
  };

  return updateFilter;
}
