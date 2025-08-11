import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// ------------------- Async Actions -------------------

export const fetchReminders = createAsyncThunk(
  "reminders/fetchReminders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminder`
      );
      return data.reminders;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRemindersCount = createAsyncThunk(
  "reminders/getRemindersCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/remindersCount`
      );
      return data.remindersCount;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const snoozeReminder = createAsyncThunk(
  "reminders/snoozeReminder",
  async ({ reminderId, minutes }, { dispatch, rejectWithValue }) => {

    console.log("Snoozing reminder:", reminderId, "for", minutes, "minutes");

    if (!reminderId) return;

    const newTime = new Date(Date.now() + minutes * 60 * 1000);

    try {
      const { status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/${reminderId}`,
        { scheduledAt: newTime.toISOString() }
      );

      if (status === 200) {
        toast.success(`Snoozed for ${minutes} minutes`);
        dispatch(setShowReminder(false));
        dispatch(getRemindersCount());
        dispatch(fetchReminders());
      }
    } catch (err) {
      toast.error("Failed to snooze reminder");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markAsReadReminder = createAsyncThunk(
  "reminders/markAsReadReminder",
  async (reminderId, { dispatch, rejectWithValue }) => {
    try {
      const { status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/${reminderId}/markAsRead`
      );

      if (status === 200) {
        toast.success("Marked as Read");
        dispatch(decrementUnreadCount());
        dispatch(fetchReminders());
      }
    } catch (err) {
      toast.error("Failed to mark as read reminder");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const completeReminder = createAsyncThunk(
  "reminders/completeReminder",
  async (reminderId, { dispatch, rejectWithValue }) => {
    try {
      const { status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/${reminderId}/complete`
      );

      if (status === 200) {
        toast.success("Reminder is marked as completed!");
        dispatch(setShowReminder(false));
        dispatch(getRemindersCount());
        dispatch(fetchReminders());
      }
    } catch (err) {
      toast.error("Failed to stop reminder");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ------------------- Slice -------------------

const reminderSlice = createSlice({
  name: "reminders",
  initialState: {
    reminders: [],
    unread_reminders_count: 0,
    showReminder: false,
    reminderData: null,
    loadingReminders: false,
    error: null,
  },
  reducers: {
    setShowReminder: (state, action) => {
      state.showReminder = action.payload;
    },
    setReminderData: (state, action) => {
      state.reminderData = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unread_reminders_count += 1;
    },
    decrementUnreadCount: (state) => {
      state.unread_reminders_count -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.loadingReminders = true;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loadingReminders = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loadingReminders = false;
        state.error = action.payload;
      })
      .addCase(getRemindersCount.fulfilled, (state, action) => {
        state.unread_reminders_count = action.payload;
      });
  },
});

export const {
  setShowReminder,
  setReminderData,
  incrementUnreadCount,
  decrementUnreadCount,
} = reminderSlice.actions;

export default reminderSlice.reducer;
