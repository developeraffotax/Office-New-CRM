import { MdDragIndicator } from "react-icons/md";

const icons = {
  DragHandleIcon: (props) => <MdDragIndicator {...props} />,
};

// Spread these into any table
export const columnOrderingOptions = {
  enableColumnOrdering: true,
  enableGrouping: false,
  icons,
  muiColumnDragHandleProps: {
    className: "mrt-drag-handle",
    sx: {
      position: "absolute",
      top: 2,
      right: 6,
      p: 0,
      opacity: 0,
      color: "#9ca3af",
      transition: "opacity .15s",
      "&:hover": { color: "#374151", background: "transparent" },
      "& svg": { fontSize: 14 },
    },
  },
};

// Merge this into each table's muiTableHeadCellProps.sx
export const headCellHoverSx = {
  "&:hover .mrt-drag-handle": { opacity: 1 },
};