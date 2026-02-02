import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRemindersCount } from "../../../redux/slices/reminderSlice";

export const useReminders = () => {
  const dispatch = useDispatch();
  const unread_reminders_count = useSelector(
    (state) => state.reminder.unread_reminders_count
  );
  const showReminder = useSelector((state) => state.reminder.showReminder);
  const [showReminderNotificationPanel, setShowReminderNotificationPanel] =
    useState(false);

  useEffect(() => {
    dispatch(getRemindersCount());
  }, [dispatch]);

  return {
    unread_reminders_count,
    showReminder,
    showReminderNotificationPanel,
    setShowReminderNotificationPanel,
  };
};
