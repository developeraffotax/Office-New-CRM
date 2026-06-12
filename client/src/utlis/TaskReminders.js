import { useEffect, useState } from "react";
import { BiBell } from "react-icons/bi";
import { format } from "date-fns";
import axios from "axios";

const TaskReminders = ({ taskId, refreshKey }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    const fetchReminders = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminders/${taskId}`
        );

        console.log("REMINDERS", reminders)
        if (data.success) setReminders(data.reminders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, [taskId, refreshKey]);

  if (loading || reminders.length === 0) return null;

  return (
    <div className="w-full flex flex-wrap gap-1.5 mt-1">
      {reminders.map((r) => (
        <div
          key={r._id}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-[13px] text-gray-700"
        >
          <BiBell className="h-3 w-3 shrink-0 text-pink-400" />
          <span className="font-medium truncate max-w-[140px]">{r.title}</span>
          <span className="text-gray-300">·</span>
          <span className="whitespace-nowrap text-gray-400">
            {format(new Date(r.scheduledAt), "dd MMM h:mm a")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TaskReminders;