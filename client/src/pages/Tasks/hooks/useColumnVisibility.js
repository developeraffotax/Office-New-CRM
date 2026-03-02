import { useEffect, useState } from "react";
import colVisibility from "../Constants/colVisibility";

const useColumnVisibility = () => {
  const [columnVisibility, setColumnVisibility] = useState({
    _id: false,
    ...colVisibility,
  });

  useEffect(() => {
    // Load saved column visibility from localStorage
    const savedVisibility = JSON.parse(
      localStorage.getItem("visibileTasksColumn"),
    );

    if (savedVisibility) {
      setColumnVisibility(savedVisibility);
    }
  }, []);

  const toggleColumnVisibility = (column) => {
    const updatedVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    setColumnVisibility(updatedVisibility);
    localStorage.setItem(
      "visibileTasksColumn",
      JSON.stringify(updatedVisibility),
    );
  };
  return { columnVisibility, setColumnVisibility, toggleColumnVisibility };
};

export default useColumnVisibility;
