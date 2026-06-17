 
import { useState, useEffect, useMemo, useRef } from "react";
import clsx from "clsx";

export default function AssignCategory({
  categories = [],
  conversationId,
  currentCategory,
  updateConversation,
  buttonStyle = "",
  showLabel = false,
}) {
  const [updating, setUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categoryObj = useMemo(() => {
    return categories.find((c) => c.name === selectedCategory);
  }, [categories, selectedCategory]);

  const updateCategory = async (categoryName) => {
    try {
      setUpdating(true);
      setSelectedCategory(categoryName);
      setOpen(false);
      await updateConversation(conversationId, { category: categoryName });
    } catch (error) {
      console.error("Failed to update category", error);
      setSelectedCategory(currentCategory);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {showLabel && categoryObj && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded text-white "
          style={{ backgroundColor: categoryObj.color }}
        >
          {categoryObj.name}
        </span>
      )}

      {/* Custom dropdown */}
      <div ref={ref} className={clsx("relative", buttonStyle)}>
        <button
            disabled={updating}
            onClick={() => setOpen((o) => !o)}
            className={clsx(
              "h-6 w-full rounded-md border px-1.5 text-xs font-medium flex items-center gap-1.5",
              "outline-none transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              categoryObj
                ? "border-transparent text-white"
                : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
            )}
            style={categoryObj ? { backgroundColor: categoryObj.color } : undefined}
          >
            {/* Color dot when a category is selected */}
            {categoryObj && (
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-75 shrink-0" />
            )}

            <span className="truncate flex-1 text-left">
              {categoryObj
                ? categoryObj.name.charAt(0).toUpperCase() + categoryObj.name.slice(1)
                : "No Category"}
            </span>

            <svg
              className="w-3 h-3 opacity-50 shrink-0"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>

        {open && (
          <div className="absolute z-50 mt-1 left-0 min-w-[130px] rounded-md border border-gray-200 bg-white shadow-md py-1">
            {/* No Category option */}
            <button
              onClick={() => updateCategory("")}
              className={clsx(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-500  border-b",
                !selectedCategory && "font-semibold text-gray-700"
              )}
            >
              No Category
            </button>

            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => updateCategory(cat.name)}
                className="w-full text-left px-3 py-1.5 text-xs  hover:bg-gray-50  flex items-center gap-2  [&:not(:last-child)]:border-b [&:not(:last-child)]:border-gray-100"
              >
                {/* Color dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span
                  className={clsx(
                    selectedCategory === cat.name && "font-semibold"
                  )}
                >
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}







































// export default function AssignCategory({
//   categories = [],
//   conversationId,
//   currentCategory,
//   updateConversation,
//   buttonStyle = "",
//   showLabel = false,
// }) {
//   const [updating, setUpdating] = useState(false);
//   const [selectedCategory, setSelectedCategory] =
//     useState(currentCategory);

//   useEffect(() => {
//     setSelectedCategory(currentCategory);
//   }, [currentCategory]);

//   const categoryObj = useMemo(() => {
//     return categories.find(
//       (c) => c.name === selectedCategory
//     );
//   }, [categories, selectedCategory]);

//   const updateCategory = async (categoryName) => {
//     try {
//       setUpdating(true);

//       // Optimistic update
//       setSelectedCategory(categoryName);

//       await updateConversation(conversationId, {
//         category: categoryName,
//       });
//     } catch (error) {
//       console.error(
//         "Failed to update category",
//         error
//       );

//       setSelectedCategory(currentCategory);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   return (
//     <div
//       className="flex items-center gap-2"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {showLabel && categoryObj && (
//         <span
//           className="text-xs font-semibold px-2 py-0.5 rounded text-white"
//           style={{
//             backgroundColor: categoryObj.color,
//           }}
//         >
//           {categoryObj.name}
//         </span>
//       )}

//       <select
//         value={selectedCategory || ""}
//         disabled={updating}
//         onChange={(e) =>
//           updateCategory(e.target.value)
//         }
        

//         className={clsx(
//   "h-6 rounded-md border border-gray-200 bg-transparent px-1.5 text-xs bg-white",
//   "hover:border-gray-300",
//   "outline-none",
//   "disabled:opacity-50 disabled:cursor-not-allowed",
//   buttonStyle
// )}
//       >
//         <option value="">
//           No Category
//         </option>

//         {categories.map((cat) => (
//           <option
//             key={cat.name}
//             value={cat.name}
//           >
//             {cat.name.charAt(0).toUpperCase() +
//               cat.name.slice(1)}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }