// import React from 'react'

// const First = () => {
//   return (
//      <div className="w-full flex flex-col gap-3  h-[50%]">
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <FaRegUser className="h-4 w-4 text-gray-500" /> Job Holder
//               </span>
//               <span className="text-[17px] font-medium text-gray-800">
//                 {taskDetal?.jobHolder}
//               </span>
//             </div>

//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <RxPerson className="h-4 w-4 text-gray-500" />
//                 Lead
//               </span>
//               <span className="  text-gray-600">{taskDetal?.lead}</span>
//             </div>

//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <GoGoal className="h-4 w-4 text-gray-500" /> Status
//               </span>
//               <select
//                 value={taskDetal?.status}
//                 onChange={(e) => {
//                   handleStatusChange(taskDetal._id, e.target.value);
//                 }}
//                 className="w-[8rem] h-[2rem] rounded-md border border-sky-500 outline-none"
//               >
//                 <option value="">Select Status</option>
//                 <option value="Todo">Todo</option>
//                 <option value="Progress">Progress</option>
//                 <option value="Review">Review</option>
//                 <option value="Onhold">Onhold</option>
//               </select>
//             </div>
//             {/*  */}

//             {/*  */}

//             <hr />

//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <FiClock className="h-4 w-4 text-gray-500" />
//                 Total Hours
//               </span>
//               <span className="  text-gray-600">{taskDetal?.hours}</span>
//             </div>

//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <GoClockFill className="h-4 w-4 text-gray-500" />
//                 Spent Hours
//               </span>
//               <span className="  text-gray-600">
//                 {taskDetal?.estimate_Time}
//               </span>
//             </div>

//             <div className="flex items-center gap-4">
//               <span className=" flex items-center gap-1 text-gray-500 w-[30%] ">
//                 <BsCalendarDate className="h-4 w-4 text-gray-500" />
//                 Start Date
//               </span>
//               <span className=" text-gray-600   ">
//                 {taskDetal?.hours ? (
//                   <span>
//                     {format(
//                       new Date(
//                         taskDetal?.startDate || "2024-07-26T00:00:00.000+00:00"
//                       ),
//                       "dd-MMM-yyyy"
//                     )}
//                   </span>
//                 ) : (
//                   <span className="text-red-500">N/A</span>
//                 )}
//               </span>
//             </div>

//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <BsCalendarDateFill className="h-4 w-4 text-gray-500" />
//                 Deadline
//               </span>
//               <span className="  text-gray-600">
//                 {format(
//                   new Date(
//                     taskDetal?.deadline || "2024-07-26T00:00:00.000+00:00"
//                   ),
//                   "dd-MMM-yyyy"
//                 )}
//               </span>
//             </div>

//             <hr />

//             {/*  */}
//             <div className="flex items-center gap-4  ">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <RiTimerLine className="h-4 w-4 text-gray-500" /> Timer
//               </span>
//               <span className="text-[17px] font-medium text-gray-800">
//                 <Timer
//                   ref={timerRef}
//                   clientId={auth?.user?.id}
//                   jobId={taskDetal?._id}
//                   setIsShow={setIsShow}
//                   note={note}
//                   setNote={setNote}
//                   taskLink={"/tasks"}
//                   pageName={"Tasks"}
//                   taskName={taskDetal?.project?.projectName || ""}
//                   department={taskDetal?.project?.projectName || ""}
//                   clientName={taskDetal?.project?.projectName || ""}
//                   companyName={taskDetal?.project?.projectName || ""}
//                   JobHolderName={taskDetal?.jobHolder || ""}
//                   projectName={""}
//                   task={taskDetal?.task || ""}
//                 />
//               </span>
//             </div>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 text-gray-500 w-[30%]">
//                 <BiBellPlus className="h-4 w-4 text-gray-500" />
//                 Add Reminder
//               </span>
//               <span
//                 onClick={() => setShowReminder(true)}
//                 className=" text-pink-500 hover:text-pink-600"
//               >
//                 <BiSolidBellPlus className="h-7 w-7 cursor-pointer " />
//               </span>
//             </div>
//             {/*  */}
//           </div>
//   )
// }

// export default First