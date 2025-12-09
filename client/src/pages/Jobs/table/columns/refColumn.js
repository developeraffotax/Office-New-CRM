import toast from "react-hot-toast";

export const refColumn = () => {
  return {
    id: "jobRef",
    accessorFn: (row) => row.jobRef || "-", // safely handle missing jobRef
    header: "Ref",
    size: 80,
    // enableColumnFilter: true,
    // enableSorting: true,
    // sortingFn: "alphanumeric",
    Cell: ({ cell }) => {
      const handleCopy = () => {
        navigator.clipboard.writeText(cell.getValue());
        toast.success(`Copied ${cell.getValue()}`);
      };


      return (
        <span
        className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-sm cursor-pointer "
        onClick={handleCopy}
        title="Click to copy"
      >
        {cell.getValue()}
      </span>
      )
    },
    
  };
};
