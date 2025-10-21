import { RiLoader2Fill } from "react-icons/ri";
import ReactQuill from "react-quill";

export const JobDetailTab = ({
  clientDetail,
  auth,
  showEdit,
  setShowEdit,
  workPlan,
  setWorkPlan,
  handleWorkPlan,
  load,
}) => {
  return (
    <div className="flex flex-col w-full px-2 h-full">
      <div className="flex flex-col">
        <div className="grid grid-cols-2">
          <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
            Client Name
          </span>
          <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
            {clientDetail?.clientName ? (
              clientDetail?.clientName
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2">
          <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
            Company Name
          </span>

          <span className="border border-gray-300 text-gray-600 py-2 px-2">
            <span
              className={` py-1 px-3 rounded-[1.5rem] ${
                clientDetail?.companyName.length > 25 && "text-[14px]"
              }  w-full shadow-md bg-cyan-500 text-white`}
            >
              {clientDetail?.companyName ? (
                clientDetail?.companyName
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2">
          <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
            Registeration Name
          </span>
          <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
            {clientDetail?.regNumber ? (
              clientDetail?.regNumber
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </div>

        {auth?.user?.role?.name === "Admin" && (
          <div className="grid grid-cols-2">
            <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
              Email
            </span>
            <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
              {clientDetail?.email ? (
                clientDetail?.email
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </div>
        )}

        {auth?.user?.role?.name === "Admin" && (
          <div className="grid grid-cols-2">
            <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
              Phone
            </span>
            <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
              {clientDetail?.phone ? (
                clientDetail?.phone
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2">
          <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
            Hours
          </span>
          <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
            {clientDetail?.totalHours ? (
              clientDetail?.totalHours
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </div>
      </div>
      {/* -----------Work Plan--------- */}
      {/* <div className="min-h-[20rem] w-full rounded-lg border border-gray-300 shadow-md bg-white p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-700">Work Plan</h2>
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => setShowEdit(!showEdit)}
          >
            {clientDetail?.workPlan ? "Edit" : "Add"}
          </button>
        </div>
        <hr className="w-full  h-[1px] bg-gray-400 mb-2" />
        {showEdit ? (
          <form onSubmit={handleWorkPlan} className="relative h-[15rem]">
            <ReactQuill
              className="w-full h-[10rem] rounded-lg"
              placeholder="Type your work plan here..."
              value={workPlan}
              onChange={(value) => setWorkPlan(value)}
            />
            <div className="w-full absolute mt-[3rem] flex items-center justify-end ">
              <button
                type="submit"
                className="py-2 px-4 rounded-md shadow text-white bg-orange-500 hover:bg-orange-600 cursor-auto"
              >
                {load ? (
                  <RiLoader2Fill className="h-5 w-5 animate-spin text-white" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: clientDetail?.workPlan,
            }}
            className="whitespace-pre-wrap break-words"
          ></div>
        )}
      </div> */}
    </div>
  );
};
