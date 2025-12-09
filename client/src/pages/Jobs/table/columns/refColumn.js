import toast from "react-hot-toast";
import { formatRef, refFilterFn } from "../../../../utlis/formatRef";

export const refColumn = () => {
  return {
    id: "jobRef",
    accessorFn: (row) => row.jobRef || "", // safely handle missing jobRef
    // header: "Ref",
    size: 80,

    Header: ({ column }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Ref</span>

          {/* 🔍 Header Search Input */}
          <input
            type="text"
            placeholder="Search..."
            className="border rounded px-2 py-1 text-sm"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
          />
        </div>
      );
    },
    filterFn: refFilterFn,

    // enableColumnFilter: true,
    // enableSorting: true,
    // sortingFn: "alphanumeric",
    Cell: ({ cell }) => {
      const prefix = "J";
      const number = cell.getValue();
      const cellValue = formatRef(prefix, number);

      const handleCopy = () => {
         if(!number) return;
        navigator.clipboard.writeText(cellValue);
        toast.success(`Copied ${cellValue}`);
      };

      return (
        <span
          className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-sm cursor-pointer "
          onClick={handleCopy}
          title="Click to copy"
        >
          {cellValue}
        </span>
      );
    },
  };
};
