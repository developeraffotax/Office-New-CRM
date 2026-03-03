import { createContext, useContext, useMemo } from "react";

const LeadColumnContext = createContext(null);

export function LeadColumnProvider({ value, children }) {
  const memoValue = useMemo(() => value, [value]);
  return (
    <LeadColumnContext.Provider value={memoValue}>
      {children}
    </LeadColumnContext.Provider>
  );
}

export function useLeadColumns() {
  const ctx = useContext(LeadColumnContext);
  if (!ctx)
    throw new Error("useLeadColumns must be used inside LeadColumnProvider");
  return ctx;
}
