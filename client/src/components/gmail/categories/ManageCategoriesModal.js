// components/ManageCategoriesModal.jsx
import { useEffect, useState } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryApi";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

export default function ManageCategoriesModal({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", color: "#6366f1" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await fetchCategories();
    setCategories(res.data);
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleSubmit = async () => {
    if (!form.name) return;

    if (editingId) {
      await updateCategory(editingId, form);
    } else {
      await createCategory(form);
    }

    setForm({ name: "", color: "#6366f1" });
    setEditingId(null);
    load();
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, color: cat.color });
  };

  const handleDelete = async (id) => {
    // if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    load();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[420px] rounded-xl shadow-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Manage Categories</h2>

        {/* Create / Edit */}
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border rounded px-2 py-1 text-sm"
          />

          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-10 h-8 border rounded"
          />

          <button
            onClick={handleSubmit}
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm flex items-center gap-1"
          >
            <FiPlus />
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* Category list */}
        <div className="space-y-2 max-h-64 overflow-auto">
          {categories.map(cat => (
            <div
              key={cat._id}
              className="flex items-center justify-between p-2 rounded border"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name[0].toUpperCase() + cat.name.slice(1)}</span>
              </div>

              <div className="flex gap-2 text-gray-500">
                <button onClick={() => handleEdit(cat)}>
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(cat._id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="text-sm text-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
