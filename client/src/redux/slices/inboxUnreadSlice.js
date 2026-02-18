import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Async thunk to fetch unread counts
export const fetchInboxUnreadCounts = createAsyncThunk(
  "inboxUnread/fetchCounts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/unread-counts`
      );

      if (!data.success) {
        return rejectWithValue("Failed to fetch unread counts");
      }

      console.log(" THES RESULT ", data)

      return data.counts; // { affotax: 12, outsource: 5 }
    } catch (err) {
      return rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);

const initialState = {
  companies: {
    affotax: { inboxUnread: 0 },
    outsource: { inboxUnread: 0 },
  },
  loading: false,
  error: null,
};

const inboxUnreadSlice = createSlice({
  name: "inboxUnread",
  initialState,
  reducers: {
    setInboxUnread(state, action) {
      const { companyName, count } = action.payload;

      if (!state.companies[companyName]) {
        state.companies[companyName] = { inboxUnread: 0 };
      }

      state.companies[companyName].inboxUnread = count;
    },

    incrementInboxUnread(state, action) {
      const { companyName, value = 1 } = action.payload;

      if (!state.companies[companyName]) {
        state.companies[companyName] = { inboxUnread: 0 };
      }

      state.companies[companyName].inboxUnread += value;
    },

    decrementInboxUnread(state, action) {
      const { companyName, value = 1 } = action.payload;

      if (!state.companies[companyName]) return;

      state.companies[companyName].inboxUnread = Math.max(
        0,
        state.companies[companyName].inboxUnread - value
      );
    },

    resetInboxUnread(state, action) {
      const { companyName } = action.payload;

      if (state.companies[companyName]) {
        state.companies[companyName].inboxUnread = 0;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxUnreadCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInboxUnreadCounts.fulfilled, (state, action) => {
        state.loading = false;

        Object.entries(action.payload).forEach(([company, count]) => {
          if (!state.companies[company]) {
            state.companies[company] = { inboxUnread: 0 };
          }

          state.companies[company].inboxUnread = count;
        });
      })
      .addCase(fetchInboxUnreadCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setInboxUnread,
  incrementInboxUnread,
  decrementInboxUnread,
  resetInboxUnread,
} = inboxUnreadSlice.actions;

export default inboxUnreadSlice.reducer;
