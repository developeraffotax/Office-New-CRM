// services/threadCategory.api.js
import axios from "axios";

const API =  `${process.env.REACT_APP_API_URL}/api/v1/gmail/category`;

export const fetchCategories = () => axios.get(API);
export const createCategory = (data) => axios.post(API, data);
export const updateCategory = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteCategory = (id) => axios.delete(`${API}/${id}`);
