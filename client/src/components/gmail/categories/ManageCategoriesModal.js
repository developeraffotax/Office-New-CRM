// components/ManageCategoriesModal.jsx
import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../redux/api/inboxCategoryApi";

import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

export default function ManageCategoriesModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    color: "#6366f1",
  });

  const [editingId, setEditingId] = useState(null);

  // -----------------------------
  // RTK Query
  // -----------------------------

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
  } = useGetCategoriesQuery(undefined, {
    skip: !open,
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const isSaving = isCreating || isUpdating;

  // -----------------------------
  // Handlers
  // -----------------------------

  const handleSubmit = async () => {
    const name = form.name.trim();

    if (!name) return;

    try {
      if (editingId) {
        await updateCategory({
          id: editingId,
          data: {
            name,
            color: form.color,
          },
        }).unwrap();
      } else {
        await createCategory({
          name,
          color: form.color,
        }).unwrap();
      }

      // Reset form
      setForm({
        name: "",
        color: "#6366f1",
      });

      setEditingId(null);
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);

    setForm({
      name: cat.name,
      color: cat.color,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id).unwrap();

      // No need to call load().
      // RTK Query invalidates ThreadCategory automatically.
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      name: "",
      color: "#6366f1",
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[420px] rounded-xl shadow-lg p-4">
        <h2 className="text-sm font-semibold mb-3">
          Manage Categories
        </h2>

        {/* Create / Edit */}
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Category name"
            value={form.name}
            disabled={isSaving}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            className="flex-1 border rounded px-2 py-1 text-sm"
          />

          <input
            type="color"
            value={form.color}
            disabled={isSaving}
            onChange={(e) =>
              setForm({
                ...form,
                color: e.target.value,
              })
            }
            className="w-10 h-8 border rounded"
          />

          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || isSaving}
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus />

            {isSaving
              ? "Saving..."
              : editingId
                ? "Update"
                : "Add"}
          </button>
        </div>

        {/* Cancel edit */}
        {editingId && (
          <button
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="text-xs text-gray-500 mb-3"
          >
            Cancel edit
          </button>
        )}

        {/* Category list */}
        <div className="space-y-2 max-h-64 overflow-auto">
          {isCategoriesLoading ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              No categories found
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: cat.color,
                    }}
                  />

                  <span className="text-sm">
                    {cat.name?.[0]?.toUpperCase()}
                    {cat.name?.slice(1)}
                  </span>
                </div>

                <div className="flex gap-2 text-gray-500">
                  <button
                    onClick={() => handleEdit(cat)}
                    disabled={isSaving || isDeleting}
                    className="disabled:opacity-40"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(cat._id)}
                    disabled={isDeleting}
                    className="disabled:opacity-40"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}