import React, { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const readSavedOrder = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSavedOrder = (key, names) => {
  try {
    localStorage.setItem(key, JSON.stringify(names));
  } catch (err) {
    console.log(err);
  }
};

const mergeWithSavedOrder = (items, saved) => {
  const existing = new Set(items);
  const ordered = saved.filter((name) => existing.has(name));
  const savedSet = new Set(saved);
  const fresh = items.filter((name) => !savedSet.has(name));
  return [...ordered, ...fresh];
};

const reorderList = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function DraggableDepartmentChips({
  departments = [], // ["Payroll", ...] OR [{ name: "Payroll" }, ...]
  activeDepartment = "",
  onSelect,
  storageKey,
  droppableId = "departments",
}) {
  const [savedOrder, setSavedOrder] = useState(() => readSavedOrder(storageKey));

  const names = useMemo(
    () => [
      ...new Set(
        departments
          .map((d) => (typeof d === "string" ? d : d?.name))
          .filter(Boolean)
      ),
    ],
    [departments]
  );

  const orderedNames = useMemo(
    () => mergeWithSavedOrder(names, savedOrder),
    [names, savedOrder]
  );

  const handleDragEnd = ({ source, destination }) => {
    if (!destination || source.index === destination.index) return;
    const reordered = reorderList(orderedNames, source.index, destination.index);
    setSavedOrder(reordered);
    writeSavedOrder(storageKey, reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} direction="horizontal">
        {(dropProvided) => (
          <ul
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className="flex items-center gap-2 list-none flex-wrap"
          >
            {orderedNames.map((name, index) => (
              <Draggable key={name} draggableId={name} index={index}>
                {(dragProvided, snapshot) => (
                  <li
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    onClick={() => onSelect(name)}
                    className={`${
                      activeDepartment === name
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } px-2 py-1 rounded-md !cursor-pointer m-0 select-none ${
                      snapshot.isDragging ? "shadow-lg" : ""
                    }`}
                  >
                    {name}
                  </li>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}