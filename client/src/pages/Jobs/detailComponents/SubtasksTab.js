import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FaEdit } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiLoaderFill } from "react-icons/ri";
import { ModalPortal } from "../ModalPortal";
import { SubtaskListManager } from "../SubtaskListManager";
 

export const SubtasksTab = ({
  subTaskData,
  subTask,
  setSubtask,
  handleCreateSubtask,
  handleCreateSubtaskFromTemplate,
  subTaskLoading,
  handleOnDragEnd,
  updateSubtaskStatus,
  handleDeleteSubTask,
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleApplyTemplate = async (items) => {
     const reverseArr = [...items].reverse();
    for (const item of reverseArr) {
      await handleCreateSubtaskFromTemplate(item.title);
    }
    
    setShowTemplateModal(false);
  };

  return (
    <div className="flex flex-col w-full px-2 h-[90%]">
      {/* Header / Add Subtask */}
      <div className="flex items-center gap-2 w-full">
        <form
          onSubmit={handleCreateSubtask}
          className="flex items-center gap-2 w-full py-1 px-2 border bg-gray-50 border-gray-300 rounded-lg"
        >
          <input
            type="text"
            value={subTask}
            onChange={(e) => setSubtask(e.target.value)}
            placeholder="Add Subtask..."
            className="py-2 px-1 border-none bg-transparent outline-none w-full"
          />
          <button
            type="submit"
            className="py-[7px] px-4 rounded-md shadow bg-orange-500 hover:bg-orange-600 text-white"
          >
            {subTaskLoading ? (
              <RiLoaderFill className="h-6 w-6 animate-spin text-white" />
            ) : (
              "Add"
            )}
          </button>

          {/* 🔸 New Templates Button */}
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="py-[7px] px-4 rounded-md shadow bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Templates
          </button>
        </form>
      </div>

      {/* Checklist */}
      <div className="mt-2 py-1 rounded-md border border-gray-300 flex flex-col gap-3 overflow-hidden">
        <h3 className="text-[17px] w-full font-semibold py-2 text-gray-900 border-b-[1px] px-2 border-gray-300">
          Checklist (
          {subTaskData.filter((s) => s.status === "complete").length}/
          {subTaskData?.length})
        </h3>

        <div className="px-2 overflow-y-auto">
          {subTaskData.length > 0 ? (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="subTaskData">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ listStyle: "none", paddingBottom: 0 }}
                  >
                    {subTaskData?.map(({ _id, subTask, status }, index) => (
                      <Draggable key={_id} draggableId={_id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              padding: "8px",
                              marginBottom: "4px",
                              backgroundColor:
                                status === "complete" ? "#d4edda" : "#f3f3f3",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="checkbox"
                                checked={status === "complete"}
                                onChange={() => updateSubtaskStatus(_id)}
                                style={{ accentColor: "orangered" }}
                                className="h-5 w-5 cursor-pointer"
                              />
                              <p
                                className={`text-[15px] ${
                                  status === "complete" && "line-through"
                                }`}
                              >
                                {subTask}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <FaEdit
                                className="h-5 w-5 cursor-pointer text-gray-800 hover:text-sky-600"
                                onClick={() => setSubtask(subTask)}
                              />
                              <IoCloseCircleOutline
                                size={22}
                                className="cursor-pointer hover:text-red-500"
                                onClick={() => handleDeleteSubTask(_id)}
                              />
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="w-full py-8 flex items-center flex-col justify-center">
              <img
                src="/notask1.png"
                alt="No_Task"
                className="h-[12rem] w-[16rem] animate-pulse"
              />
              <span className="text-center text-[14px] text-gray-500">
                Subtask not available!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Template Modal */}
      
        {showTemplateModal && <div className="absolute inset-0 z-50">
          
          <SubtaskListManager onApplyList={handleApplyTemplate} onClose={() => setShowTemplateModal(false)} />
            
            </div>}
       
    </div>
  );
};
