import { createContext, useContext, useMemo } from "react";

const LeadUserContext = createContext(null);

export function LeadUserProvider({ value, children }) {
  const memoValue = useMemo(() => value, [value]);

  return (
    <LeadUserContext.Provider value={memoValue}>
      {children}
    </LeadUserContext.Provider>
  );
}

export function useLeadUser() {
  const ctx = useContext(LeadUserContext);
  if (!ctx) throw new Error("useLeadUser must be used within LeadUserProvider");
  return ctx;
}
