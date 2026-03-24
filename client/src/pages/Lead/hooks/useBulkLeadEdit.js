import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { updates_object_init } from "../constants/updates_object_init";

export default function useBulkLeadEdit({ rowSelection, onSuccess }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updates, setUpdates] = useState(updates_object_init);

  // BULK EDITING
  const handleOnChangeUpdate = (e) => {
    setUpdates((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };
  // -------Update Bulk Leads------------->
  const updateBulkLeads = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    console.log("Row Selection", rowSelection);
    console.log("Updates", updates);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/bulk/leads`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true,
          ),
          updates,
        },
      );

      if (data) {
        setUpdates(updates_object_init);
        toast.success("Leads Updated💚💚");
        onSuccess?.();
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdating(false);
    }
  };
  return { updates, isUpdating, handleOnChangeUpdate, updateBulkLeads };
}
