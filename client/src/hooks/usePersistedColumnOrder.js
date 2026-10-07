import { useEffect, useCallback } from "react";

// Plain function (not a hook): read the saved order for initialState
export const getSavedColumnOrder = (storageKey) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) && saved.length ? saved : undefined;
  } catch {
    return undefined;
  }
};

// Hook: call it right after useMaterialReactTable
export const usePersistedColumnOrder = (table, storageKey) => {
  const columnOrder = table.getState().columnOrder;

  useEffect(() => {
    if (!columnOrder?.length) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(columnOrder));
    } catch {
      // storage full or blocked: ignore
    }
  }, [storageKey, columnOrder]);

  const resetColumnOrder = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}

    const displayIds = table
      .getAllLeafColumns()
      .map((c) => c.id)
      .filter((id) => id.startsWith("mrt-")); // row select, row numbers, etc.

    const defIds = table.options.columns.map((c) => c.id ?? c.accessorKey);

    table.setColumnOrder([...displayIds, ...defIds]);
  }, [table, storageKey]);

  return { resetColumnOrder };
};