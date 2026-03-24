import { createContext, useContext, useMemo } from "react";

const LeadContext = createContext(null);

export function LeadProvider({ value, children }) {
  const memoValue = useMemo(() => value, [value]);
  return (
    <LeadContext.Provider value={memoValue}>{children}</LeadContext.Provider>
  );
}

export function useLeadUser() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLeadUser must be used within LeadProvider");
  return ctx;
}

export function useLeadColumns() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLeadColumns must be used within LeadProvider");
  return ctx;
}
