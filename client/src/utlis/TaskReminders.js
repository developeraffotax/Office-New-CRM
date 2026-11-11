import { useEffect, useState } from "react";
import { BiBell, BiEditAlt } from "react-icons/bi";
import { format } from "date-fns";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import { useSelector } from "react-redux";
import { style } from "../utlis/CommonStyle"; // ← adjust path if needed

const TaskReminders = ({ taskId, refreshKey, onReminderUpdated }) => {
  const auth = useSelector((state) => state.auth.auth);

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Full Edit Modal state
  const [editingGroup, setEditingGroup] = useState(null); // the reminder object that was clicked
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);

  // ---------- Fetch current user's reminders for this task ----------
  const fetchReminders = async () => {
    if (!taskId) return;
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminders/${taskId}`
      );
      if (data.success) setReminders(data.reminders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // ---------- Delete entire group ----------
const handleDeleteGroup = async () => {
  if (!editingGroup) return;

  const confirmed = window.confirm(
    "Are you sure you want to delete this reminder for everyone? This cannot be undone."
  );
  if (!confirmed) return;

  setSaving(true);
  try {
    const { data } = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/v1/reminders/delete/group/${editingGroup.groupId}`
    );

    if (data.success) {
      toast.success("Reminder deleted for everyone!");
      setEditingGroup(null);
      fetchReminders();
      onReminderUpdated?.();
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Failed to delete reminder");
  } finally {
    setSaving(false);
  }
};




  useEffect(() => {
    fetchReminders();
  }, [taskId, refreshKey]);

  // ---------- Load all users (for the select) ----------
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
        );
        setAllUsers(
          data?.users?.map((u) => ({ _id: u._id, name: u.name })) || []
        );
      } catch (error) {
        console.log(error);
      }
    };
    getAllUsers();
  }, []);

  // ---------- Open Full Group Edit ----------
  const openGroupEdit = async (reminder) => {
    // Only creator can open full edit
    if (reminder.createdBy?.toString() !== auth?.user?.id?.toString()) {
      return;
    }

    setEditingGroup(reminder);
    setEditTitle(reminder.title || "");
    setEditDescription(reminder.description || "");

    // Convert to datetime-local format
    const d = new Date(reminder.scheduledAt);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditScheduledAt(local);

    // Load all users currently in this group
    setLoadingGroup(true);
    try {
      // We reuse the same endpoint pattern – fetch all reminders of this group
      // (You can also create a dedicated endpoint if you prefer)
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminders/${taskId}`
      );

      // Filter by groupId and get unique users
      const groupReminders = (data.reminders || []).filter(
        (r) => r.groupId?.toString() === reminder.groupId?.toString()
      );

      // Because getRemindersByTaskId only returns current user's reminders,
      // we need a better way. For now we will temporarily store users from
      // the single reminder and let the user re-add others.
      // Better solution below ↓

      // Temporary fallback (will improve with group endpoint)
      setUsersList([
        {
          _id: reminder.userId,
          name: auth?.user?.name || "You",
        },
      ]);
    } catch (err) {
      console.error(err);
      setUsersList([]);
    } finally {
      setLoadingGroup(false);
    }
  };

  // ---------- Better: Fetch full group members ----------
  // Add this small helper endpoint on backend if you want perfect data:
  // GET /reminders/group/:groupId  → returns all reminders of the group

  // For now we will improve openGroupEdit with a dedicated call:

  const openGroupEditProper = async (reminder) => {
    if (reminder.createdBy?.toString() !== auth?.user?.id?.toString()) {
      toast.error("Only the creator can edit this reminder");
      return;
    }

    setEditingGroup(reminder);
    setEditTitle(reminder.title || "");
    setEditDescription(reminder.description || "");

    const d = new Date(reminder.scheduledAt);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditScheduledAt(local);

    setLoadingGroup(true);
    try {
      // We will create a simple group fetch endpoint
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/group/${reminder.groupId}`
      );

      if (data.success) {
        // Extract unique users from the group
        const uniqueUsers = [];
        const seen = new Set();

        data.reminders.forEach((r) => {
          const uid = r.userId?._id || r.userId;
          if (!seen.has(uid.toString())) {
            seen.add(uid.toString());
            uniqueUsers.push({
              _id: uid,
              name: r.userId?.name || "Unknown",
            });
          }
        });

        setUsersList(uniqueUsers);
      }
    } catch (err) {
      console.error(err);
      // fallback
      setUsersList([{ _id: auth.user.id, name: auth.user.name }]);
    } finally {
      setLoadingGroup(false);
    }
  };

  // ---------- Save Group Update ----------
  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup || usersList.length === 0) {
      toast.error("At least one user is required");
      return;
    }

    setSaving(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/update/group/${editingGroup.groupId}`,
        {
          title: editTitle,
          description: editDescription,
          scheduledAt: editScheduledAt,
          usersList,
        }
      );

      if (data.success) {
        toast.success("Reminder updated successfully!");
        setEditingGroup(null);
        fetchReminders();
        onReminderUpdated?.();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update reminder");
    } finally {
      setSaving(false);
    }
  };

  // ---------- User list helpers ----------
  const handleAddUser = (user) => {
    if (usersList.some((u) => u._id === user._id)) {
      return toast.error("User already added");
    }
    setUsersList([...usersList, user]);
  };

  const handleRemoveUser = (id) => {
    setUsersList(usersList.filter((u) => u._id !== id));
  };

  // ---------- Render ----------
  if (loading || reminders.length === 0) return null;

  return (
    <>
      <div className="w-full flex flex-wrap gap-1.5 mt-1">
        {reminders.map((r) => {
          const isCreator =
            r.createdBy?.toString() === auth?.user?.id?.toString();

          return (
            <div
              key={r._id}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-[13px] text-gray-700 hover:border-pink-300 transition"
            >
              <BiBell className="h-3 w-3 shrink-0 text-pink-400" />
              <span className="font-medium truncate max-w-[140px]">
                {r.title}
              </span>
              <span className="text-gray-300">·</span>
              <span className="whitespace-nowrap text-gray-400">
                {format(new Date(r.scheduledAt), "dd MMM h:mm a")}
              </span>

              {/* Full Edit button – only for creator */}
              {isCreator && (
                <button
                  type="button"
                  onClick={() => openGroupEditProper(r)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-pink-50"
                  title="Edit reminder (all users)"
                >
                  <BiEditAlt className="h-3.5 w-3.5 text-pink-500" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= FULL GROUP EDIT MODAL ================= */}
     {/* ================= FULL GROUP EDIT MODAL ================= */}
{editingGroup && (
  <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Edit Reminder
        </h3>
        <button
          onClick={() => setEditingGroup(null)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <IoClose className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleUpdateGroup} className="p-5 space-y-4">
        {/* Selected Users */}
        {usersList.length > 0 && (
          <div className="w-full flex items-center gap-2 flex-wrap border py-2 px-2 rounded-md border-gray-300">
            {usersList.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-2 bg-purple-600 text-white py-1 px-2 rounded-md text-sm"
              >
                <span>{user.name}</span>
                <span
                  className="cursor-pointer bg-red-500/40 p-0.5 rounded-full hover:bg-red-500"
                  onClick={() => handleRemoveUser(user._id)}
                >
                  <IoClose className="h-3.5 w-3.5" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add User Select */}
        <select
          value=""
          className={`${style.input}`}
          onChange={(e) => {
            if (e.target.value) {
              handleAddUser(JSON.parse(e.target.value));
            }
          }}
        >
          <option value="">Select User</option>
          {allUsers.map((user) => (
            <option
              key={user._id}
              value={JSON.stringify({ _id: user._id, name: user.name })}
            >
              {user.name}
            </option>
          ))}
        </select>

        {/* Title */}
        <div className="inputBox">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className={`${style.input} w-full`}
            required
          />
          <span>Title</span>
        </div>

        {/* Description */}
        <div className="inputBox">
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={`${style.input} w-full resize-none`}
            style={{ height: "6rem" }}
          />
          <span>Description</span>
        </div>

        {/* DateTime */}
        <div className="inputBox">
          <input
            type="datetime-local"
            value={editScheduledAt}
            onChange={(e) => setEditScheduledAt(e.target.value)}
            className={`${style.input} w-full`}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3">
          {/* Delete for everyone */}
          <button
            type="button"
            onClick={handleDeleteGroup}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <TbLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete for everyone"
            )}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditingGroup(null)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingGroup}
              className={`${style.button1} text-sm flex items-center gap-2`}
              style={{ padding: "0.45rem 1.1rem" }}
            >
              {saving ? (
                <TbLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update Reminder"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}
    </>
  );
};

export default TaskReminders;