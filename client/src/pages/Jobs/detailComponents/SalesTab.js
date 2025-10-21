import { format } from "date-fns";

export const SalesTab = ({ clientDetail }) => {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
          Date
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
          {clientDetail?.currentDate ? (
            <span>
              {format(
                new Date(
                  clientDetail?.currentDate || "2024-07-26T00:00:00.000+00:00"
                ),
                "dd-MMM-yyyy"
              )}
            </span>
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
          Source
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2">
          {clientDetail?.source ? (
            clientDetail?.source
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Client Type
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
          <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-yellow-500 text-white">
            {clientDetail?.clientType ? (
              clientDetail?.clientType
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Partner
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
          <span className="   ">
            {clientDetail?.partner ? (
              clientDetail?.partner
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Courtry
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
          {clientDetail?.country ? (
            clientDetail?.country
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
          Fee
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
          {clientDetail?.fee ? (
            clientDetail?.fee
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
    </div>
  );
};
