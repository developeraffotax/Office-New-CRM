// EntityDropdown.jsx
import React, { forwardRef } from "react";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";

const EntityDropdown = forwardRef(
  (
    {
      show,
      entities = [],
      labelKey = "name",
      onComplete,
      onEdit,
      onDelete,
    },
    ref // ✅ this will now be the forwarded ref
  ) => {
    if (!show) return null;

    return (
      <div
         onClick={(e) => e.stopPropagation()}
        ref={ref} // ✅ ref now points to the real DOM element
        className="absolute top-9 right-[-3.5rem] flex flex-col gap-2 max-h-[16rem] overflow-y-auto z-[99] border rounded-sm shadow-sm bg-gray-50 py-2 px-2 w-[14rem]"
      >
        {entities?.map((entity) => (
          <div
            key={entity._id}
            className="w-full flex items-center justify-between gap-1 rounded-md bg-white border py-1 px-1 hover:bg-gray-100"
          >
            <p className="text-[13px] w-[8rem] truncate">{entity[labelKey]}</p>

            <div className="flex items-center gap-1">
              {onComplete && (
                <span title="Complete" onClick={() => onComplete(entity._id)}>
                  <IoCheckmarkDoneCircleSharp className="h-5 w-5 cursor-pointer text-green-500 hover:text-green-600 transition-all duration-200" />
                </span>
              )}

              {onEdit && (
                <span title="Edit" onClick={() => onEdit(entity._id)}>
                  <MdOutlineEdit className="h-5 w-5 cursor-pointer hover:text-sky-500 transition-all duration-200" />
                </span>
              )}

              {onDelete && (
                <span title="Delete" onClick={() => onDelete(entity._id)}>
                  <AiTwotoneDelete className="h-5 w-5 cursor-pointer hover:text-red-500 transition-all duration-200" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default EntityDropdown;
