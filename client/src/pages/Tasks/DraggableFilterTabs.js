import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DraggableFilterTabs = ({
  droppableId,
  items,
  // setItems,
  filterValue,
  tasks,
  getCountFn,
  getLabelFn,
  
  onClick,
  onDragEnd,
  activeClassName,
}) => {




  const [orderedItems, setOrderedItems] = useState(items)

  
  

  
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

 

function mergeWithSavedOrder(fetchedItems, savedOrder) {
  if (!Array.isArray(savedOrder)) return fetchedItems;

  const savedIds = savedOrder.map((item) => item._id); // keep IDs only
  const fetchedMap = new Map(fetchedItems.map((item) => [item._id, item]));

  // Preserve saved order (only items that still exist)
  const ordered = savedIds
    .filter((id) => fetchedMap.has(id))
    .map((id) => fetchedMap.get(id));

  // Add any new items not in saved order
  const newOnes = fetchedItems.filter((item) => !savedIds.includes(item._id));

  return [...ordered, ...newOnes];
}

const handleUserOnDragEnd = (result) => {
  if (!result.destination) return; // no drop location

  const { source, destination } = result;

  if (
    source.index === destination.index && 
    source.droppableId === destination.droppableId
  ) {
    return; // dropped in the same place
  }

  const ordered_items = reorder(orderedItems, source.index, destination.index);
  localStorage.setItem(`${droppableId}_order`, JSON.stringify(ordered_items));
  setOrderedItems(ordered_items);
};

 

 
  // 🔑 Always sync items with saved order
  useEffect(() => {
    const savedOrder = JSON.parse(localStorage.getItem(`${droppableId}_order`));

    if (savedOrder) {
      const merged = mergeWithSavedOrder(items, savedOrder);
      setOrderedItems(merged);
    } else {
      setOrderedItems(items);
    }
  }, [items, droppableId]);



  return (
    <DragDropContext onDragEnd={handleUserOnDragEnd}>
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex items-center gap-2 overflow-x-auto"
          >
            {orderedItems?.map((item, index) => {
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
