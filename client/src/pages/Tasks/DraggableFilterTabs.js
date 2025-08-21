import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DraggableFilterTabs = ({
  droppableId,
  items,
  filterValue,
  tasks,
  getCountFn,
  getLabelFn,
  
  onClick,
  onDragEnd,
  activeClassName,
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex items-center gap-2 overflow-x-auto"
          >
            {items?.map((item, index) => {
              const label = getLabelFn(item); // e.g. departmentName, projectName, user.name
              const id = item._id;

              return (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <div
                      className={`py-1 px-1 rounded-tl-md rounded-tr-md !cursor-pointer font-[500] text-[14px] ${
                        filterValue === label ? activeClassName : ""
                      }`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      
                      onClick={() => onClick(item)}
                    >
                      {label} ({getCountFn(item, tasks)})
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
  );
};

export default DraggableFilterTabs;
