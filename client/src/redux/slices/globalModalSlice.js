import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeModal: null, // "ticket" | "job" | "task"
  modalData: null,   // { ticketId } | { clientId } | { taskId }
};

const globalModalSlice = createSlice({
  name: "globalModal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.activeModal = modal;
      state.modalData = data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

export const { openModal, closeModal } = globalModalSlice.actions;
export default globalModalSlice.reducer;
