import { useState, useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import { FiChevronDown } from "react-icons/fi";
import { useClickOutside } from "../../../../utlis/useClickOutside";

export default function AssignCategory({
  categories = [],
  mongoThreadId,
  currentCategory,
  handleUpdateThread,
  buttonStyle = "",
  showLabel = false,
  
  onToggle = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  const ref = useRef();


  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    onToggle(open);
  }, [open]);

  const categoryObj = useMemo(() => {
    return categories.find((c) => c.name === selectedCategory);
  }, [categories, selectedCategory]);

  const updateCategory = async (categoryName) => {
    try {
      setUpdating(true);
      setOpen(false);

      // optimistic UI update
      setSelectedCategory(categoryName);

      await handleUpdateThread(mongoThreadId, { category: categoryName });
    } catch (error) {
      console.error("Failed to update category", error);
      setSelectedCategory(currentCategory);
    } finally {
      setUpdating(false);
    }
  };

  useClickOutside(ref, () => {
      setOpen(false)
  })

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      {/* Label */}
      {showLabel && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded text-white"
          style={{ backgroundColor: categoryObj?.color }}
        >
          {categoryObj?.name || ""}
        </span>
      )}

      {/* Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={clsx(
          "flex items-center gap-1 text-xs px-2 py-1 border border-gray-200 bg-white rounded-md hover:bg-gray-50",
          buttonStyle
        )}
      >
        {categoryObj
          ? categoryObj.name.charAt(0).toUpperCase() +
            categoryObj.name.slice(1)
          : "Select"}

        <FiChevronDown className="size-3 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 border border-gray-200 rounded-lg bg-white shadow-xl z-50 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Categories
          </div>

          {categories.map((cat) => (
            <button
              key={cat.name}
              disabled={updating}
              onClick={() => updateCategory(cat.name)}
              className={clsx(
                "flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b last:border-0",
                selectedCategory === cat.name
                  ? "text-blue-600 font-semibold bg-blue-50/50"
                  : "text-gray-700"
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />

              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </button>
          ))}

          {/* Clear category */}
          <button
            disabled={updating || !selectedCategory}
            onClick={() => updateCategory("")}
            className={clsx(
              "w-full px-3 py-2 text-left text-sm",
              selectedCategory
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            Remove category
          </button>
        </div>
      )}
    </div>
  );
}