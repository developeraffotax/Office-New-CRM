import { useDispatch } from "react-redux";
import { deleteReminder } from "../../../redux/slices/reminderSlice";
 

const DeleteUpcomingReminderModal = ({ reminder, onClose }) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    await dispatch(deleteReminder(reminder._id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[360px] rounded-xl shadow-xl p-5 space-y-4">
        <div className="text-lg font-semibold text-gray-800">
          Delete Reminder?
        </div>

        <p className="text-sm text-gray-600">
          This upcoming reminder will be permanently deleted.
        </p>

        <div className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg p-2">
          {reminder.title}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUpcomingReminderModal;
