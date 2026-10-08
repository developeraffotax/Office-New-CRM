import React, { useCallback, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DEFAULT_STORAGE_KEY = "jobs:department_order";
const ALL = "All";

// ---------- localStorage helpers (store department names only) ----------
const readSavedOrder = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
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

// Saved order first (only departments that still exist), then any new ones
const mergeWithSavedOrder = (items, saved) => {
  const existing = new Set(items);
  const ordered = saved.filter((name) => existing.has(name));

  const savedSet = new Set(saved);
  const fresh = items.filter((name) => !savedSet.has(name));

  return [...ordered, ...fresh];
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// ---------- Shared tab styling ----------
const tabClass = (isActive, isDragging = false) => `
  relative flex items-center gap-1 px-2 py-1.5 cursor-pointer
  text-[13px] font-[400] whitespace-nowrap shrink-0
  rounded-t-md border-b-2 font-google !cursor-pointer
  ${
    isActive
      ? "text-orange-600 border-orange-500 bg-orange-50"
      : "text-gray-800 border-transparent hover:text-gray-900 hover:bg-gray-50"
  }
  ${isDragging ? "shadow-lg bg-white" : ""}
`;

const ActiveUnderline = () => (
  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
);

/**
 * Props
 * - departments:       string[]  (may include "All" — it is pinned first and not draggable)
 * - activeDepartment:  currently selected department ("All" when none)
 * - getCount:          (departmentName) => number   (also called with "All")
 * - onSelect:          (departmentName) => void     ("All" is passed for the All tab)
 * - storageKey:        optional localStorage key
 */
const DraggableDepartmentTabs = ({
  departments = [],
  activeDepartment = ALL,
  getCount,
  onSelect,
  storageKey = DEFAULT_STORAGE_KEY,
}) => {
  const [savedOrder, setSavedOrder] = useState(() => readSavedOrder(storageKey));

  // Draggable list excludes "All"; derived so it stays in sync with props
  const orderedDepartments = useMemo(
    () =>
      mergeWithSavedOrder(
        departments.filter((dep) => dep !== ALL),
        savedOrder,
      ),
    [departments, savedOrder],
  );

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;
      if (!destination) return;
      if (source.index === destination.index) return;

      const reordered = reorder(
        orderedDepartments,
        source.index,
        destination.index,
      );

      setSavedOrder(reordered);
      writeSavedOrder(storageKey, reordered);
    },
    [orderedDepartments, storageKey],
  );

  const isAllActive = activeDepartment === ALL;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-center gap-1">
        {/* "All" tab — fixed, not draggable */}
        <div onClick={() => onSelect(ALL)} className={tabClass(isAllActive)}>
          <span className="tracking-wide">All ({getCount(ALL)})</span>
          {isAllActive && <ActiveUnderline />}
        </div>

        {/* Draggable department tabs */}
        <Droppable droppableId="departments" direction="horizontal">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="flex items-center gap-1"
            >
              {orderedDepartments.map((dep, index) => {
                const isActive = activeDepartment === dep;

                return (
                  <Draggable key={dep} draggableId={dep} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        onClick={() => onSelect(dep)}
                        className={tabClass(isActive, snapshot.isDragging)}
                      >
                        <span className="tracking-wide">
                          {dep} ({getCount(dep)})
                        </span>
                        {isActive && <ActiveUnderline />}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default DraggableDepartmentTabs;