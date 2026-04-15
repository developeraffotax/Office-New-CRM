 
export const budgetColumn = ({ auth }) => {
  return {
    id: "Budget",
    accessorKey: "totalTime",
    Header: ({ column }) => {
      return (
        <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
          <span className="w-full text-center ">Budget</span>
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      const totalTime = row.original.totalTime;

      return (
        <div className="flex items-center gap-1 w-full ">
          <span className="text-[1rem]">⏳</span>
          <span>{totalTime}</span>
        </div>
      );
    },
    size: 80,
  };
};






 