import axios from "axios";

const BASE = `${process.env.REACT_APP_API_URL}/api/v1/google-sheets`;

// any signed-in user
export const fetchMySheetsApi = () => axios.get(`${BASE}/mine`);
export const getSheetApi = (id) => axios.get(`${BASE}/${id}`);

// admin
export const getAllSheetsApi = () => axios.get(BASE);
export const getAssignableUsersApi = () => axios.get(`${BASE}/assignable-users`);
export const createSheetApi = (payload) => axios.post(BASE, payload);
export const updateSheetApi = (id, payload) => axios.put(`${BASE}/${id}`, payload);
export const deleteSheetApi = (id) => axios.delete(`${BASE}/${id}`);