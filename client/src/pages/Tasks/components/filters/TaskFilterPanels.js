import DraggableFilterTabs from "./DraggableFilterTabs";
import OutsideFilter from "../../../Jobs/utils/OutsideFilter";

const TaskFilterPanels = ({
  // visibility flags
  showJobHolder,
  showDue,
  showStatus,
  activeBtn,
  // data
  selectedUsers,
  tasksData,
  filter3,
  active,
  active1,
  setActive1,
  dateStatus,
  status,
  auth,
  // count functions
  getJobHolderCount,
  getDueAndOverdueCountByDepartment,
  getStatusCount,
  // actions
  filterByProjStat,
  updateJobHolder,
  setColumnFromOutsideTable,
}) => (
  <>
    {/* ----------Job Holder Summary Filters---------- */}
    {showJobHolder && activeBtn === "jobHolder" && (
      <>
        <div className="w-full py-2 max-lg:hidden">
          <div className="flex items-center flex-wrap gap-4">
            <DraggableFilterTabs
              droppableId={"users"}
              items={selectedUsers
                .map((uName) => ({ _id: uName, name: uName }))
                .filter((user) => getJobHolderCount(user?.name, active) > 0)}
              filterValue={filter3}
              tasks={tasksData}
              getCountFn={(user, tasks) =>
                tasks.filter((t) => t.jobHolder === user.name).length
              }
              getLabelFn={(user) => user.name}
              onClick={(user) => {
                const newValue = filter3 === user?.name ? "" : user?.name;
                updateJobHolder(newValue);
                setColumnFromOutsideTable("status", "Progress");
                setColumnFromOutsideTable("taskDate", "");
                if (
                  auth.user?.role?.name === "Admin" &&
                  user?.name === auth?.user?.name
                ) {
                  setColumnFromOutsideTable("taskDate", "Today");
                }
              }}
              activeClassName={
                filter3 ? "border-b-2 text-orange-600 border-orange-600" : ""
              }
            />
            <div className="border-l px-5">
              <OutsideFilter
                setColumnFromOutsideTable={setColumnFromOutsideTable}
                title={"taskDate"}
              />
            </div>
          </div>
        </div>
        <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
      </>
    )}

    {/* ----------Date Status Summary Filters---------- */}
    {showDue && activeBtn === "due" && (
      <>
        <div className="w-full py-2">
          <div className="flex items-center flex-wrap gap-4">
            {dateStatus?.map((stat, i) => {
              const { due, overdue } =
                getDueAndOverdueCountByDepartment(active);
              return (
                <div
                  className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                    active1 === stat &&
                    "border-b-2 text-orange-600 border-orange-600"
                  }`}
                  key={i}
                  onClick={() => {
                    setActive1(stat);
                    filterByProjStat(stat, active);
                  }}
                >
                  {stat === "Due" ? (
                    <span>Due {due}</span>
                  ) : (
                    <span>Overdue {overdue}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
      </>
    )}

    {/* ----------Status Summary Filters---------- */}
    {showStatus && activeBtn === "status" && (
      <>
        <div className="w-full py-2 flex items-center overflow-x-auto hidden1 gap-2">
          <div className="flex items-center gap-4">
            {dateStatus?.map((stat, i) => {
              const { due, overdue } =
                getDueAndOverdueCountByDepartment(active);
              return (
                <div
                  className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                    active1 === stat &&
                    "border-b-2 text-orange-600 border-orange-600"
                  }`}
                  key={i}
                  onClick={() => {
                    setActive1(stat);
                    filterByProjStat(stat, active);
                  }}
                >
                  {stat === "Due" ? (
                    <span>Due {due}</span>
                  ) : (
                    <span>Overdue {overdue}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            {status?.map((stat, i) => (
              <div
                className={`py-1 rounded-tl-md min-w-[4rem] sm:min-w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  active1 === stat &&
                  "border-b-2 text-orange-600 border-orange-600"
                }`}
                key={i}
                onClick={() => {
                  setActive1(stat);
                  filterByProjStat(stat, active);
                }}
              >
                {stat} ({getStatusCount(stat, active)})
              </div>
            ))}
          </div>
        </div>
        <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
      </>
    )}
  </>
);

export default TaskFilterPanels;
