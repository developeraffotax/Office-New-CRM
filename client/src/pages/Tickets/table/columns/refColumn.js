import toast from "react-hot-toast";
import { formatRef, refFilterFn } from "../../../../utlis/formatRef";

export const refColumn = () => {
  return {
    id: "ticketRef",
    accessorFn: (row) => row.ticketRef || "", // safely handle missing jobRef
    // header: "Ref",
    size: 80,

    Header: ({ column }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Ref</span>

          {/* 🔍 Header Search Input */}
          <input
            type="text"
             
            className="border font-normal rounded px-2 py-1 text-sm outline-none"
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

    // 🔍 Custom filter logic

    Cell: ({ cell }) => {
      const prefix = "TK";
      const number = cell.getValue();
      const cellValue = formatRef(prefix, number);

      const handleCopy = () => {
        if(!number) return;
        navigator.clipboard.writeText(cellValue);
        toast.success(`Copied ${cellValue}`);
      };

      return (
        <span
          className=" text-gray-700 font-semibold text-sm cursor-pointer "
          onClick={handleCopy}
          title="Click to copy"
        >
          {cellValue}
        </span>
      );
    },
  };
};
