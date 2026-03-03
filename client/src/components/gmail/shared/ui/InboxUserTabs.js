import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function InboxUserTabs({
  droppableId = "inbox_users",
  users = [],
  activeValue,
  onChange,
  getCountFn,
  showAll = true,
  getLabelFn = (u) => u,
}) {
  const [orderedUsers, setOrderedUsers] = useState([]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  function mergeWithSavedOrder(fetched, savedOrder) {
    if (!Array.isArray(savedOrder)) return fetched;
    const savedIds = savedOrder.map((u) => u._id || u);
    const map = new Map(fetched.map((u) => [u._id || u, u]));
    const ordered = savedIds.filter((id) => map.has(id)).map((id) => map.get(id));
    const newOnes = fetched.filter((u) => !savedIds.includes(u._id || u));
    return [...ordered, ...newOnes];
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = reorder(orderedUsers, result.source.index, result.destination.index);
    localStorage.setItem(`${droppableId}_order`, JSON.stringify(reordered));
    setOrderedUsers(reordered);
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`${droppableId}_order`));
    const merged = mergeWithSavedOrder(users, saved);
    setOrderedUsers(merged);
  }, [users, droppableId]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex items-center   border-gray-200 overflow-x-auto no-scrollbar bg-white w-full"
          >
            {/* ---------------- ALL TAB ---------------- */}
            {showAll && (
              <div
                onClick={() => onChange("")}
                className={`
                  relative px-4 py-2 text-sm transition-all cursor-pointer whitespace-nowrap
                  ${activeValue === "" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent"}
                `}
              >
                All 
                <span className="ml-1.5 text-xs font-normal  ">
                 ( {getCountFn ? getCountFn("all") : 0})
                </span>
              </div>
            )}

            {/* ---------------- USER TABS ---------------- */}
            {orderedUsers.map((user, index) => {
              const id = user._id || user;
              const label = getLabelFn(user);
              const count = getCountFn ? getCountFn(user) : 0;
              const isActive = activeValue === id;

              return (
                <Draggable key={id} draggableId={String(id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onChange(isActive ? "" : id)}
                      className={`
                        group relative px-4 py-2 text-sm transition-all whitespace-nowrap select-none
                        !cursor-pointer active:cursor-grabbing
                        ${isActive 
                          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/20" 
                          : "text-gray-500 border-b-2 border-transparent hover:text-gray-800 hover:bg-gray-50"}
                        ${snapshot.isDragging ? "bg-white shadow-xl ring-1 ring-gray-200 opacity-100 z-50" : ""}
                      `}
                    >
                      {label}
                      <span className={`ml-1.5 text-xs font-normal ${isActive ? "text-blue-600" : "text-gray-600"}`}>
                        ({count})
                      </span>
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
}