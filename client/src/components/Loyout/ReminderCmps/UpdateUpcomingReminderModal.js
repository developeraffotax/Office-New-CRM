import { useState } from "react";
import moment from "moment";
import { useDispatch } from "react-redux";
import { updateReminder } from "../../../redux/slices/reminderSlice";

const UpdateUpcomingReminderModal = ({ reminder, onClose }) => {
  const dispatch = useDispatch();
  const [scheduledAt, setScheduledAt] = useState(
    moment(reminder.scheduledAt).format("YYYY-MM-DDTHH:mm")
  );
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await dispatch(
      updateReminder({
        reminderId: reminder._id,
        scheduledAt,
      })
    );
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-xl shadow-xl p-5 space-y-4">
        <div className="text-lg font-semibold text-gray-800">
          Reschedule Reminder
        </div>

        <div className="text-sm text-gray-500">
          {reminder.title}
        </div>

        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          min={moment().format("YYYY-MM-DDTHH:mm")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleUpdate}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateUpcomingReminderModal;
