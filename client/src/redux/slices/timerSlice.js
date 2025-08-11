// src/redux/slices/timerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const channel = new BroadcastChannel("task-timer-channel");

let timeoutRef = null;

const scheduleTimeout = (dispatch, endTime) => {
  console.log("Scheduling timeout for endTime:", endTime);
  const duration = endTime - new Date();

  console.log("Duration until timeout:", duration);

  if (duration <= 0) {
    dispatch(setShowModal(true));
    console.log("Task is overdue immediately!💛💛💛💛💛");
    return;
  }

  timeoutRef = setTimeout(() => {
    dispatch(setShowModal(true));
    console.log("Task is overdue!💛💛💛💛💛💛💛💛💛💛💛");
  }, duration);
};

const initialState = {
  showModal: false,
  task: "",
  taskId: "",
  timerId: "",
};

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setTaskData: (state, action) => {
      state.task = action.payload.task || "";
      state.taskId = action.payload.taskId || "";
      state.timerId = action.payload.timerId || "";
    },
    resetTimer: (state) => {
      state.showModal = false;
      state.task = "";
      state.taskId = "";
      state.timerId = "";
    },
  },
});

export const { setShowModal, setTaskData, resetTimer } = timerSlice.actions;
export default timerSlice.reducer;

/* ---------------- Actions (same logic as before) ---------------- */

export const stopCountdown = () => (dispatch) => {
  localStorage.removeItem(`task-timer`);
  clearTimeout(timeoutRef);
  dispatch(setShowModal(false));
  channel.postMessage({ type: "STOP_TIMER" });
};

export const updateCountdown = (newAllocatedTimeInHours) => (dispatch) => {
  const saved = JSON.parse(localStorage.getItem("task-timer"));
  if (!saved) {
    console.warn("No existing task timer found to update.");
    return;
  }

  const startTime = saved.timerStartedAt
    ? new Date(saved.timerStartedAt)
    : new Date();

  const newEndTime = new Date(
    startTime.getTime() + Number(newAllocatedTimeInHours) * 60 * 60000
  );

  saved.endTime = newEndTime.toISOString();
  localStorage.setItem("task-timer", JSON.stringify(saved));

  clearTimeout(timeoutRef);
  scheduleTimeout(dispatch, newEndTime);

  channel.postMessage({
    type: "UPDATE_TIMER",
    task: saved.task,
    timerId: saved.timerId,
    endTime: newEndTime.toISOString(),
  });

  console.log("Timer updated with new allocated time:", newAllocatedTimeInHours);
};

export const snooze = (SNOOZE_TIME) => (dispatch) => {
  const saved = JSON.parse(localStorage.getItem("task-timer"));
  dispatch(setTaskData({ task: saved.task, taskId: saved.taskId, timerId: saved.timerId }));

  const newEndTime = new Date(Date.now() + SNOOZE_TIME * 60000);
  saved.endTime = newEndTime.toISOString();

  localStorage.setItem(`task-timer`, JSON.stringify(saved));

  channel.postMessage({ type: "SNOOZE", newEndTime: newEndTime.toISOString() });

  dispatch(setShowModal(false));
  clearTimeout(timeoutRef);
  scheduleTimeout(dispatch, newEndTime);
};

export const startCountdown = (ALLOCATED_TIME, taskId, task, timerId) => (dispatch) => {
  dispatch(setTaskData({ task, taskId, timerId }));

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + Number(ALLOCATED_TIME) * 60 * 60000);

  localStorage.setItem(
    `task-timer`,
    JSON.stringify({
      taskId,
      task,
      timerId,
      timerStartedAt: startTime.toISOString(),
      endTime: endTime.toISOString(),
    })
  );

  channel.postMessage({
    type: "START_TIMER",
    task,
    timerId,
    endTime: endTime.toISOString(),
  });

  scheduleTimeout(dispatch, endTime);
};

/* ---------------- Init listener (runs once) ---------------- */
export const initTimerListener = () => (dispatch) => {
  // Load saved timer on init
  const saved = JSON.parse(localStorage.getItem("task-timer"));
  if (saved && saved.endTime) {
    dispatch(setTaskData({ task: saved.task, taskId: saved.taskId, timerId: saved.timerId }));
    const endTime = new Date(saved.endTime);
    const now = new Date();
    if (now.getTime() > endTime.getTime()) {
      dispatch(setShowModal(true));
      console.log("Task is overdue!💛💛💛💛💛💛💛💛 💛");
    } else {
      scheduleTimeout(dispatch, endTime);
    }
  }

  channel.onmessage = (event) => {
    const { type, newEndTime, task, timerId, endTime } = event.data;

    if (type === "SHOW_MODAL") {
      dispatch(setShowModal(true));
    }

    if (type === "SNOOZE") {
      const snoozedEndTime = new Date(newEndTime);
      clearTimeout(timeoutRef);
      scheduleTimeout(dispatch, snoozedEndTime);
      dispatch(setShowModal(false));
    }

    if (type === "STOP_TIMER") {
      clearTimeout(timeoutRef);
      dispatch(setShowModal(false));
      localStorage.removeItem("task-timer");
    }

    if (type === "START_TIMER") {
      dispatch(setTaskData({ task, timerId }));
      const snoozedEndTime = new Date(endTime);
      clearTimeout(timeoutRef);
      scheduleTimeout(dispatch, snoozedEndTime);
      dispatch(setShowModal(false));
    }

    if (type === "UPDATE_TIMER") {
      dispatch(setTaskData({ task, timerId }));
      const updatedEndTime = new Date(endTime);
      clearTimeout(timeoutRef);
      scheduleTimeout(dispatch, updatedEndTime);
      dispatch(setShowModal(false));
      console.log("[Broadcast] Timer updated with new end time");
    }
  };
};
