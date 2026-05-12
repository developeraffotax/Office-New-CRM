// hooks/useSavedFilters.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/v1/saved-filters`;

export function useSavedFilters(page) {
  const [savedFilters, setSavedFilters] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchSavedFilters = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}?page=${page}`);
      if (data.success) setSavedFilters(data.filters);
    } catch (e) {
      console.error(e);
    }
  }, [page]);

  useEffect(() => { fetchSavedFilters(); }, [fetchSavedFilters]);

  const saveFilter = async (name, page, filters) => {
    setLoadingSaved(true);
    try {
      const { data } = await axios.post(API, { name, page, filters });
      if (data.success) setSavedFilters((prev) => [data.filter, ...prev]);
      return data.filter;
    } finally {
      setLoadingSaved(false);
    }
  };

  const deleteFilter = async (id) => {
    await axios.delete(`${API}/${id}`);
    setSavedFilters((prev) => prev.filter((f) => f._id !== id));
  };

  return { savedFilters, saveFilter, deleteFilter, loadingSaved, fetchSavedFilters };
}