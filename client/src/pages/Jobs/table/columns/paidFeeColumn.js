import { GoCheckCircleFill } from "react-icons/go";

export const paidFeeColumn = ({ totalClientPaidFee }) => {
  return {
    id: "Fee",
    accessorKey: "fee",

    Header: ({ column }) => {
      return (
        <div className=" flex flex-col gap-[2px] w-full items-center justify-center  ">
          <span
            className="ml-1 w-full flex items-center gap-0.5  text-center cursor-pointer "
            title="Filter out the empty fees"
            onClick={() => {
              column.setFilterValue("empty");
            }}
          >
            Fee
            <GoCheckCircleFill className="text-green-500 text-lg" />
          </span>
          <span
            title={totalClientPaidFee}
            className="font-medium w-full flex cursor-pointer text-center text-[12px] px-2 py-1 rounded-md bg-gray-50 text-black"
          >
            {totalClientPaidFee}
          </span>
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      const clientPaidFee = row.original.clientPaidFee;

      return (
        <div className="w-full flex items-center justify-center">
          <span className="text-[15px] font-medium">
            {clientPaidFee ? (
              clientPaidFee
            ) : (
              <span className="text-white">.</span>
            )}
          </span>
        </div>
      );
    },

    size: 60,
  };
};
