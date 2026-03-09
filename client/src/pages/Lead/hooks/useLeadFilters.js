import { useRef, useState } from "react";

const useLeadFilters = () => {
  const [selectFilter, setSelectFilter] = useState("");
  const [active, setActive] = useState(false);

  const anchorRef = useRef(null);
  const [filterInfo, setFilterInfo] = useState({
    col: null,
    value: "",
    type: "eq",
  });

  const handleFilterClick = (e, colKey) => {
    e.stopPropagation();
    anchorRef.current = e.currentTarget;
    setFilterInfo({ col: colKey, value: "", type: "eq" });
  };

  const handleCloseFilter = () => {
    setFilterInfo({ col: null, value: "", type: "eq" });
    anchorRef.current = null;
  };

  return {
    selectFilter,
    setSelectFilter,
    active,
    setActive,
    anchorRef,
    filterInfo,
    setFilterInfo,
    handleFilterClick,
    handleCloseFilter,
  };
};

export default useLeadFilters;
