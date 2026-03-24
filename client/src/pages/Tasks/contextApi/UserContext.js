import { createContext, useContext, useMemo } from "react";

const TaskCtx = createContext(null);

export function TaskProvider({ value, children }) {
  const memo = useMemo(() => value, [value]);
  return <TaskCtx.Provider value={memo}>{children}</TaskCtx.Provider>;
}

export function useTaskCtx() {
  const ctx = useContext(TaskCtx);
  if (!ctx) throw new Error("useTaskCtx must be inside TaskProvider");
  return ctx;
}
