import { IoBriefcaseOutline } from "react-icons/io5";
import {
  MdOutlineAnalytics,
  MdOutlineModeEdit,
  MdOutlineQueryStats,
} from "react-icons/md";
import { BsGraphUpArrow } from "react-icons/bs";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import RefreshLeadsButton from "../ui/RefreshLeadsButton";
import RenderColumnControls from "./RenderColumnControls";
import FollowupDateFilter from "../ui/FollowupDateFilter";
import BulkLeadEditForm from "./BulkLeadEditForm";

const Tabswitcher = ({
  selectedTab,
  setSelectedTab,
  active,
  setActive,
  showUserLeadChart,
  setShowUserLeadChart,
  showEdit,
  setShowEdit,
  showcolumn,
  setShowColumn,
  boxRef,
  auth,
  showJobHolder,
  setShowJobHolder,
  navigate,
  getAllLeads,
  load,
  handleUserOnDragEnd,
  active1,
  setActive1,
  setColumnFromOutsideTable,
  getJobHolderCount,
  selectedUsers,
  sources,
  getSourceCount,
  sourcePercentage,
  updates,
  isUpdating,
  handleOnChangeUpdate,
  updateBulkLeads,
  users,
  departments,
  brands,
  leadSource,
  stages,
}) => {
  return (
    <>
      <div className="flex items-center  gap-5">
        <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
          <button
            className={`py-1 px-4  outline-none transition-all duration-300  w-[6rem] ${
              selectedTab === "progress"
                ? "bg-orange-500 text-white "
                : "text-black bg-gray-100"
            }`}
            onClick={() => setSelectedTab("progress")}
          >
            Progress
          </button>
          <button
            className={`py-1 px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
              selectedTab === "won"
                ? "bg-orange-500 text-white"
                : "text-black bg-gray-100 hover:bg-slate-200"
            }`}
            onClick={() => {
              setSelectedTab("won");
            }}
          >
            Won
          </button>
          <button
            className={`py-1 px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
              selectedTab === "lost"
                ? "bg-orange-500 text-white"
                : "text-black bg-gray-100 hover:bg-slate-200"
            }`}
            onClick={() => {
              setSelectedTab("lost");
              // navigate("/tickets/complete");
            }}
          >
            Lost
          </button>
        </div>
        <button
          onClick={() => setActive(!active)}
          className={`flex items-center justify-center px-2 py-[4px] mt-[1.2rem] bg-gray-100  border border-gray-300 ${
            active && "bg-orange-600 text-white border-orange-500"
          }   rounded-md hover:shadow-md `}
        >
          <MdOutlineAnalytics className="h-7 w-7" />
        </button>

        <div className="flex justify-center items-center  mt-[1.2rem]   ">
          <span
            className={` p-2 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              showUserLeadChart && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setShowUserLeadChart((prev) => !prev);
            }}
            title="Show User Lead Chart"
          >
            <BsGraphUpArrow className="h-5 w-5  cursor-pointer" />
          </span>
        </div>

        {/* Edit Multiple Job Button */}

        <div className="flex justify-center items-center  mt-[1.2rem]   ">
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              showEdit && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setShowEdit(!showEdit);
            }}
            title="Edit Multiple Jobs"
          >
            <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
          </span>
        </div>

        {/* Hide & Show Button And Fixed Component*/}
        <div className="flex justify-center items-center  mt-[1.2rem]   ">
          <div
            className={`  p-[6px]  rounded-md hover:shadow-md   bg-gray-50 cursor-pointer border  ${
              showcolumn && "bg-orange-500 text-white"
            }`}
            onClick={() => setShowColumn(!showcolumn)}
          >
            {showcolumn ? (
              <GoEyeClosed className="text-[22px]" />
            ) : (
              <GoEye className="text-[22px]" />
            )}
          </div>
          {showcolumn && (
            <div
              className="fixed top-[11rem] right-[20%] z-[99] max-h-[80vh] overflow-y-auto hidden1  "
              ref={boxRef}
            >
              <RenderColumnControls />
            </div>
          )}
        </div>

        {auth?.user?.role?.name === "Admin" && (
          <span
            className={`p-[6px] rounded-md hover:shadow-md bg-gray-50   cursor-pointer border  mt-[1.2rem] ${
              showJobHolder && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setShowJobHolder((prev) => !prev);
            }}
            title="Filter by Job Holder"
          >
            <IoBriefcaseOutline className="  cursor-pointer text-[22px] " />
          </span>
        )}

        {auth?.user?.role?.name === "Admin" && (
          <button
            title="Go to Leads Analytics"
            className="  p-[6px] rounded-md  bg-gray-50 hover:bg-orange-500 hover:text-white  hover:shadow-md transition   border  mt-[1.2rem] cursor-pointer"
            onClick={() => navigate("/leads/stats")}
          >
            <MdOutlineQueryStats className="   text-[22px] " />
          </button>
        )}

        {auth?.user?.role?.name === "Admin" && (
          <div className=" mt-[1.2rem] ">
            <RefreshLeadsButton getAllLeads={getAllLeads} />
          </div>
        )}
      </div>
      {load && (
        <div className="py-3">
          <div className="loader"></div>
        </div>
      )}
      <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />

      {/* ===== Section: Job-holder Strip ===== */}
      {/* ----------Job_Holder Summery Filters---------- */}
      {auth?.user?.role?.name === "Admin" && showJobHolder && (
        <>
          <div className="w-full  py-2 ">
            <div className="flex items-center flex-wrap gap-4">
              <DragDropContext onDragEnd={handleUserOnDragEnd}>
                <Droppable droppableId="users0" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex items-center gap-3 overflow-x-auto hidden1"
                    >
                      <div
                        className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                          active1 === "All" &&
                          "  border-b-2 text-orange-600 border-orange-600"
                        }`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => {
                          setActive1("All");
                          setColumnFromOutsideTable("jobHolder", "");
                        }}
                      >
                        All ( {getJobHolderCount("All", selectedTab)})
                      </div>

                      {selectedUsers
                        .filter(
                          (uName) => getJobHolderCount(uName, selectedTab) > 0,
                        )
                        .map((user, index) => {
                          console.log("THE USER IS", user);

                          return (
                            <Draggable
                              key={user}
                              draggableId={user}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 !cursor-pointer font-[500] text-[14px] ${
                                    active1 === user &&
                                    "  border-b-2 text-orange-600 border-orange-600"
                                  }`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setActive1(user);
                                    setColumnFromOutsideTable(
                                      "jobHolder",
                                      user,
                                    );
                                  }}
                                >
                                  {user} ({" "}
                                  {getJobHolderCount(user, selectedTab)})
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className=" px-5 border-l ">
                <FollowupDateFilter
                  setColumnFromOutsideTable={setColumnFromOutsideTable}
                />
              </div>
            </div>
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
        </>
      )}

      {active && (
        <>
          <div className="flex flex-col gap-2  py-1 px-4">
            <h3 className="font-semibold text-lg">Lead Source </h3>
            <div className="flex items-center gap-5">
              {sources.map((source, i) => (
                <div
                  className={`flex items-center gap-[2px] py-1 px-3 rounded-[2rem] text-white ${
                    source === "Invitation"
                      ? "bg-green-600"
                      : source === "Proposal"
                        ? "bg-pink-600"
                        : "bg-purple-600"
                  } `}
                  key={i}
                >
                  <span className="font-medium text-[1rem]">{source}</span>（
                  {getSourceCount(source)} - {sourcePercentage(source)}
                  %）
                </div>
              ))}
            </div>
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
        </>
      )}

      {/* Update Bulk Jobs */}
      {showEdit && (
        <BulkLeadEditForm
          updates={updates}
          isUpdating={isUpdating}
          onChange={handleOnChangeUpdate}
          onSubmit={updateBulkLeads}
          users={users}
          departments={departments}
          sources={sources}
          brands={brands}
          leadSource={leadSource}
          stages={stages}
        />
      )}
    </>
  );
};

export default Tabswitcher;
