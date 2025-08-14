// redux/slices/timerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
 
import { setAnyTimerRunning, setJid } from "./authSlice";

 

// Fetch current timer status
export const fetchTimerStatus = createAsyncThunk(
  "timer/fetchStatus",
  async ({ clientId, jobId }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/status`,
        { params: { clientId, jobId } }
      );

      const { _id, startTime, endTime, isRunning, jobId: jid } = data.timer;
      if (startTime && !endTime) {
        dispatch(setAnyTimerRunning(isRunning));
        dispatch(setJid(jid));

        return {
          timerId: _id,
          startTime: new Date(startTime).toISOString(),
          isRunning,
          elapsedTime: Math.floor((new Date() - new Date(startTime)) / 1000),
        };
      }
      return {};
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Start timer
export const startTimer = createAsyncThunk(
  "timer/start",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const {
        clientId,
        jobId,
        pageName,
        department,
        clientName,
        companyName,
        JobHolderName,
        projectName,
        task,
        allocatedTime,
        taskName,
        taskLink,
      } = payload;

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/start/timer`,
        {
          clientId,
          jobId,
          note: `Started work on ${pageName}`,
          type: "Timer",
          department,
          clientName,
          companyName,
          JobHolderName,
          projectName,
          task,
        }
      );

      localStorage.setItem("timer_Id", JSON.stringify(data.timer._id));
      localStorage.setItem(
        "timer_in",
        `${task ? "/tasks" : "/job-planning"}`
      );
 

      return {
        timerId: data.timer._id,
        startTime: new Date().toISOString(),
        isRunning: true,
        elapsedTime: 0,
      };
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Stop timer
export const stopTimer = createAsyncThunk(
  "timer/stop",
  async ({ timerId, note, activity, pageName, taskName, jobId }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timerId}`,
        {
          note: note || "Auto stop due to inactivity!",
          activity:
            taskName.trim() === "Training"
              ? "Non-Chargeable"
              : activity || "Chargeable",
        }
      );

      

      toast.success("Timer stopped successfully!");
      return {};
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to stop timer!");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const runningTimerSlice = createSlice({
  name: "runningTimer",
  initialState: {
    timerId: null,
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    loading: false,
  },
  reducers: {
    incrementElapsedTime: (state) => {
      if (state.isRunning) state.elapsedTime += 1;
    },
    resetTimer: (state) => {
      state.timerId = null;
      state.isRunning = false;
      state.elapsedTime = 0;
      state.startTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimerStatus.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(stopTimer.fulfilled, (state) => {
        state.isRunning = false;
        state.elapsedTime = 0;
      });
  },
});

export const { incrementElapsedTime, resetTimer } = runningTimerSlice.actions;
export default runningTimerSlice.reducer;
