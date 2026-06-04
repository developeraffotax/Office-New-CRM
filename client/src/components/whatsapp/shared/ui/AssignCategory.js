import { useState, useEffect, useMemo } from "react";
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
  const [selectedCategory, setSelectedCategory] =
    useState(currentCategory);

  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  const categoryObj = useMemo(() => {
    return categories.find(
      (c) => c.name === selectedCategory
    );
  }, [categories, selectedCategory]);

  const updateCategory = async (categoryName) => {
    try {
      setUpdating(true);

      // Optimistic update
      setSelectedCategory(categoryName);

      await updateConversation(conversationId, {
        category: categoryName,
      });
    } catch (error) {
      console.error(
        "Failed to update category",
        error
      );

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
          className="text-xs font-semibold px-2 py-0.5 rounded text-white"
          style={{
            backgroundColor: categoryObj.color,
          }}
        >
          {categoryObj.name}
        </span>
      )}

      <select
        value={selectedCategory || ""}
        disabled={updating}
        onChange={(e) =>
          updateCategory(e.target.value)
        }
        

        className={clsx(
  "h-6 rounded-md border border-gray-200 bg-transparent px-1.5 text-xs bg-white",
  "hover:border-gray-300",
  "outline-none",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  buttonStyle
)}
      >
        <option value="">
          No Category
        </option>

        {categories.map((cat) => (
          <option
            key={cat.name}
            value={cat.name}
          >
            {cat.name.charAt(0).toUpperCase() +
              cat.name.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}