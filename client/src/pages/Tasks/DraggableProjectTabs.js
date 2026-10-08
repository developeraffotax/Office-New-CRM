import React, { useCallback, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DEFAULT_STORAGE_KEY = "tasks:project_order";

// ---------- localStorage helpers (store IDs only) ----------
const readSavedOrder = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSavedOrder = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (err) {
    console.log(err);
  }
};

// Saved order first (only items that still exist), then any new items
const mergeWithSavedOrder = (items, savedIds) => {
  const map = new Map(items.map((item) => [item._id, item]));

  const ordered = savedIds.filter((id) => map.has(id)).map((id) => map.get(id));

  const savedSet = new Set(savedIds);
  const fresh = items.filter((item) => !savedSet.has(item._id));

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
  text-[13px] font-[400] whitespace-nowrap
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
 * - projects:       [{ _id, projectName }]
 * - projectFilter:  currently selected project _id ("" / undefined = All)
 * - totalCount:     number shown next to "All"
 * - getCount:       (projectId) => number
 * - onSelect:       (projectId) => void   ("" is passed for "All")
 * - storageKey:     optional localStorage key
 */
const DraggableProjectTabs = ({
  projects = [],
  projectFilter,
  totalCount = 0,
  getCount,
  onSelect,
  storageKey = DEFAULT_STORAGE_KEY,
}) => {
  const [savedOrder, setSavedOrder] = useState(() => readSavedOrder(storageKey));

  // Derived — always in sync when projects load / change
  const orderedProjects = useMemo(
    () => mergeWithSavedOrder(projects, savedOrder),
    [projects, savedOrder],
  );

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;
      if (!destination) return;
      if (source.index === destination.index) return;

      const reordered = reorder(orderedProjects, source.index, destination.index);
      const ids = reordered.map((p) => p._id);

      setSavedOrder(ids);
      writeSavedOrder(storageKey, ids);
    },
    [orderedProjects, storageKey],
  );

  const isAllActive = !projectFilter;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-center flex-row overflow-x-auto hidden1 gap-1">
        {/* "All" tab — fixed, not draggable */}
        <div onClick={() => onSelect("")} className={tabClass(isAllActive)}>
          <span className="tracking-wide">All ({totalCount})</span>
          {isAllActive && <ActiveUnderline />}
        </div>

        {/* Draggable project tabs */}
        <Droppable droppableId="projects" direction="horizontal">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="flex items-center flex-row gap-1"
            >
              {orderedProjects.map(({ _id, projectName }, index) => {
                const isActive = projectFilter === _id;

                return (
                  <Draggable key={_id} draggableId={String(_id)} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        onClick={() => onSelect(_id)}
                        className={tabClass(isActive, snapshot.isDragging)}
                      >
                        <span className="tracking-wide">
                          {projectName} ({getCount(_id)})
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

export default DraggableProjectTabs;