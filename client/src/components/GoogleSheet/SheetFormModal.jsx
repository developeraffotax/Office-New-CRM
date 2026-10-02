import React, { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import {
  createSheetApi,
  updateSheetApi,
} from "../../services/googlesheetService";

const userLabel = (u) => u.name || u.email || u._id;

export default function SheetFormModal({ sheet, allUsers, onClose, onSaved }) {
  const isEdit = Boolean(sheet);

  const [form, setForm] = useState(() => ({
    name: sheet?.name || "",
    embedUrl: sheet?.embedUrl || "",
    users: (sheet?.users || []).map((u) => u._id),
    isActive: sheet?.isActive ?? true, 
  }));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        userLabel(u).toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q),
    );
  }, [allUsers, search]);

  const toggleUser = (id) =>
    setForm((f) => ({
      ...f,
      users: f.users.includes(id)
        ? f.users.filter((x) => x !== id)
        : [...f.users, id],
    }));

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => form.users.includes(u._id));

  const toggleAllFiltered = () =>
    setForm((f) => {
      const ids = filteredUsers.map((u) => u._id);
      return {
        ...f,
        users: allFilteredSelected
          ? f.users.filter((id) => !ids.includes(id))
          : [...new Set([...f.users, ...ids])],
      };
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Sheet name is required");
    if (!form.embedUrl.trim()) return toast.error("Embed URL is required");

    try {
      setSaving(true);
      if (isEdit) {
        await updateSheetApi(sheet._id, form);
        toast.success("Sheet updated");
      } else {
        await createSheetApi(form);
        toast.success("Sheet created");
      }
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save sheet");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col max-h-[90vh] min-h-[80vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Google Sheet" : "Add Google Sheet"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <IoClose size={22} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Sheet name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Monthly Targets"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Embed URL
            </label>
            <textarea
              value={form.embedUrl}
              onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
              rows={3}
              placeholder="Paste the sheet link or the full <iframe> embed code"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only https://docs.google.com/spreadsheets/... links are accepted.
              If the sheet shows "refused to connect", use File → Share →
              Publish to web → Embed in Google Sheets.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">
                Assigned users ({form.users.length})
              </label>
              <button
                type="button"
                onClick={toggleAllFiltered}
                className="text-xs text-orange-600 hover:underline"
              >
                {allFilteredSelected ? "Deselect shown" : "Select shown"}
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:border-orange-500"
            />
            <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
              {filteredUsers.length === 0 && (
                <p className="text-sm text-gray-500 p-3">No users found</p>
              )}
              {filteredUsers.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form.users.includes(u._id)}
                    onChange={() => toggleUser(u._id)}
                    className="accent-orange-500"
                  />
                  <span className="truncate">{userLabel(u)}</span>
                  {u.email && u.name && (
                    <span className="text-xs text-gray-400 truncate">
                      {u.email}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-orange-500"
            />
            Active (visible to assigned users)
          </label>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add sheet"}
          </button>
        </div>
      </form>
    </div>
  );
}