// import React from 'react'

// const First = () => {
//   return (
//     <div className="flex flex-col w-full px-2  h-[50%] bg-teal-300">
//                 <div className="flex items-center gap-2 w-full ">
//                   <form
//                     onSubmit={handleCreateSubtask}
//                     className="flex items-center gap-2 w-full py-1 px-2 border bg-gray-50 border-gray-300 rounded-lg  "
//                   >
//                     <input
//                       type="text"
//                       value={subTask}
//                       onChange={(e) => setSubtask(e.target.value)}
//                       placeholder="Add Subtask..."
//                       className="py-2 px-1 border-none bg-transparent outline-none w-full"
//                     />
//                     <button
//                       type="submit"
//                       className="py-[7px] px-4 rounded-md shadow cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
//                     >
//                       {subTaskLoading ? (
//                         <RiLoaderFill className="h-6 w-6 animate-spin text-white" />
//                       ) : (
//                         "Add"
//                       )}
//                     </button>
//                   </form>
//                 </div>
//                 <div className="mt-2 py-1  rounded-md border border-gray-300 flex flex-col gap-3 overflow-y-auto  ">
//                   <h3 className="text-[15px] w-full font-semibold py-2 text-gray-900 border-b-[1px] px-2 border-gray-300">
//                     Checklist (
//                     {
//                       subTaskData.filter((subtask) => subtask.status === "complete")
//                         .length
//                     }
//                     /{subTaskData?.length})
//                   </h3>
//                   <div className="px-2">
//                     {subTaskData.length > 0 ? (
//                       <DragDropContext onDragEnd={handleOnDragEnd}>
//                         <Droppable droppableId="subTaskData">
//                           {(provided) => (
//                             <ul
//                               {...provided.droppableProps}
//                               ref={provided.innerRef}
//                               style={{ listStyle: "none", padding: 0 }}
//                             >
//                               {subTaskData?.map(
//                                 ({ _id, subTask, status }, index) => (
//                                   <Draggable
//                                     key={_id}
//                                     draggableId={_id}
//                                     index={index}
//                                   >
//                                     {(provided) => (
//                                       <li
//                                         ref={provided.innerRef}
//                                         {...provided.draggableProps}
//                                         {...provided.dragHandleProps}
//                                         style={{
//                                           ...provided.draggableProps.style,
//                                           padding: "8px",
//                                           marginBottom: "8px",
//                                           backgroundColor:
//                                             status === "complete"
//                                               ? "#d4edda"
//                                               : "#f3f3f3",
//                                           borderRadius: "4px",
//                                           border: "1px solid #5c5c5c",
//                                           display: "flex",
//                                           alignItems: "center",
//                                           justifyContent: "space-between",
//                                           marginLeft: "-.2rem",
    
//                                           // position: "relative",
//                                         }}
//                                         className="flex items-center flex-col justify-center gap-1"
//                                       >
//                                         <div className="w-full flex items-center flex-row justify-between gap-2">
//                                           <div className="flex items-center gap-2 w-full relative">
//                                             <div className="w-6 h-full">
//                                               <input
//                                                 type="checkbox"
//                                                 checked={status === "complete"}
//                                                 onChange={() =>
//                                                   updateSubtaskStatus(_id)
//                                                 }
//                                                 style={{
//                                                   accentColor: "orangered",
//                                                 }}
//                                                 className="h-5 w-5 mt-2 cursor-pointer  checked:bg-orange-600"
//                                               />
//                                             </div>
//                                             <p
//                                               className={`text-[15px] w-full ${
//                                                 status === "complete" &&
//                                                 "line-through"
//                                               }`}
//                                             >
//                                               {subTask}
//                                             </p>
//                                           </div>
    
//                                           <div className="flex items-center gap-1">
//                                             <span
//                                               className="p-1 cursor-pointer"
//                                               onClick={() => setSubtask(subTask)}
//                                             >
//                                               <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-sky-600" />
//                                             </span>
//                                             <span
//                                               className="p-1 cursor-pointer"
//                                               onClick={() =>
//                                                 handleDeleteSubTask(_id)
//                                               }
//                                             >
//                                               <IoCloseCircleOutline
//                                                 size={24}
//                                                 className="cursor-pointer hover:text-red-500 "
//                                                 title="Delete Subtask"
//                                               />
//                                             </span>
    
                                             
//                                           </div>
//                                         </div>
    
//                                         <div className="     w-full flex justify-start  ">
//                                           {
//                                             <select
//                                               defaultValue={taskId}
//                                               className="w-[50%] py-1 px-2 bg-transparent border border-gray-300 rounded-md cursor-pointer  "
//                                               onChange={(e) =>
//                                                 moveSubtask(
//                                                   subTask,
//                                                   taskId,
//                                                   e.target.value,
//                                                   _id
//                                                 )
//                                               }
//                                             >
//                                               {usersTasksArr?.map((item) => {
//                                                 return (
//                                                   <option
//                                                     value={item?._id}
//                                                     key={item?._id}
//                                                   >
//                                                     {item?.task}
//                                                   </option>
//                                                 );
//                                               })}
//                                             </select>
//                                           }
//                                         </div>
//                                       </li>
//                                     )}
//                                   </Draggable>
//                                 )
//                               )}
//                               {provided.placeholder}
//                             </ul>
//                           )}
//                         </Droppable>
//                       </DragDropContext>
//                     ) : (
//                       <div className="w-full py-8 flex items-center flex-col justify-center">
//                         <img
//                           src="/notask1.png"
//                           alt="No_Task"
//                           className="h-[12rem] w-[16rem] animate-pulse"
//                         />
//                         <span className="text-center text-[14px] text-gray-500">
//                           Subtask not available!
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//   )
// }

// export default First