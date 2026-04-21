import toast from "react-hot-toast";
import { formatRef} from "../../../../utlis/formatRef";

export const refColumn = () => {
  return {
    id: "taskRef",
    accessorFn: (row) => row.taskRef || "",

    size: 70,

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

    Cell: ({ cell }) => {
      const prefix = "T";
      const number = cell.getValue();
      const cellValue = formatRef(prefix, number);

      const handleCopy = () => {
        if (!number) return;
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
