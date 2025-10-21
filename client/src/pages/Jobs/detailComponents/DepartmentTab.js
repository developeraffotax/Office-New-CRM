import { format } from "date-fns";
 

export const DepartmentTab = ({ clientDetail }) => {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
          Department Name
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
          <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-indigo-500 text-white">
            {clientDetail?.job.jobName ? (
              clientDetail?.job.jobName
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
          Year End
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2">
          {format(
            new Date(
              clientDetail?.job?.yearEnd || "2024-07-26T00:00:00.000+00:00"
            ),
            "dd-MMM-yyyy"
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Deadline
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
          {clientDetail?.job?.jobDeadline ? (
            format(
              new Date(
                clientDetail?.job?.jobDeadline ||
                  "2024-07-26T00:00:00.000+00:00"
              ),
              "dd-MMM-yyyy"
            )
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Work Date
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
          {clientDetail?.job?.workDeadline ? (
            format(
              new Date(
                clientDetail?.job?.workDeadline ||
                  "2024-07-26T00:00:00.000+00:00"
              ),
              "dd-MMM-yyyy"
            )
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2  ">
          Hours
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
          {clientDetail?.job?.hours ? (
            clientDetail?.job?.hours
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2  ">
          Fee
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
          {clientDetail?.job?.fee ? (
            clientDetail?.job?.fee
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Lead
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
          {clientDetail?.job?.lead ? (
            clientDetail?.job?.lead
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
          Job Holder
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
          {clientDetail?.job?.jobHolder ? (
            clientDetail?.job?.jobHolder
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>
    </div>
  );
};
