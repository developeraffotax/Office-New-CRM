import { useState } from "react";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

const getQuarterRange = () => {
  const now = dayjs();
  return [now.startOf("quarter"), now.endOf("quarter")];
};

const getLastQuarterRange = () => {
  const now = dayjs().subtract(1, "quarter");
  return [now.startOf("quarter"), now.endOf("quarter")];
};

export const PRESET_FILTERS = {
  recent: {
    "Last 7 Days": [dayjs().subtract(7, "day"), dayjs()],
    "Last 15 Days": [dayjs().subtract(15, "day"), dayjs()],
    "Last 30 Days": [dayjs().subtract(30, "day"), dayjs()],
  },
  monthly: {
    "This Month": [dayjs().startOf("month"), dayjs().endOf("month")],
    "Last Month": [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  },
  quarterly: {
    "This Quarter": getQuarterRange(),
    "Last Quarter": getLastQuarterRange(),
  },
  yearly: {
    "This Year": [dayjs().startOf("year"), dayjs().endOf("year")],
    "Last Year": [
      dayjs().subtract(1, "year").startOf("year"),
      dayjs().subtract(1, "year").endOf("year"),
    ],
    "This Financial Year": [
      dayjs().subtract(1, "year").startOf("month"),
      dayjs().endOf("month"),
    ],
    "Last Financial Year": [
      dayjs().subtract(2, "year").startOf("month"),
      dayjs().subtract(1, "year").endOf("month"),
    ],
  },
};

const DEFAULT_DATE_RANGE = PRESET_FILTERS.recent["Last 30 Days"];
const DEFAULT_LABEL = "Last 30 Days";

export function useStatsFilters() {
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [activeLabel, setActiveLabel] = useState(DEFAULT_LABEL);
  const [lead_Source, setLeadSource] = useState("");
  const [department, setDepartment] = useState("");

  const applyPreset = (label, range) => {
    setDateRange(range);
    setActiveLabel(label);
  };

  const resetFilters = () => {
    setDateRange(DEFAULT_DATE_RANGE);
    setActiveLabel(DEFAULT_LABEL);
    setLeadSource("");
    setDepartment("");
  };

  const [start, end] = dateRange;

  return {
    dateRange,
    setDateRange,
    activeLabel,
    lead_Source,
    setLeadSource,
    department,
    setDepartment,
    applyPreset,
    resetFilters,
    start,
    end,
  };
}
