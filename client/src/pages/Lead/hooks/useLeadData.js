import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Lead_Status } from "../constants/leadStatus";
import { STORAGE_KEYS } from "../constants/storageKeys";

const useLeadData = (selectedTab) => {
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [users, setUsers] = useState([]);
  const [load, setLoad] = useState(false);
  const [valueTotal, setValueTotal] = useState(0);

  const fetchLeads = async ({
    showMainLoader = false,
    showInlineLoader = false,
  } = {}) => {
    if (showMainLoader) setIsLoading(true);
    if (showInlineLoader) setLoad(true);

    try {
      const status = Object.values(Lead_Status).includes(selectedTab)
        ? selectedTab
        : Lead_Status.LOST;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/${status}/lead`,
      );

      if (data?.leads) {
        setLeadData(data.leads);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (showMainLoader) setIsLoading(false);
      if (showInlineLoader) setLoad(false);
    }
  };

  const getAllLeads = () => fetchLeads({ showMainLoader: true });
  const getLeads = () => fetchLeads({ showInlineLoader: true });

  //   Create New Lead
  const handleCreateLead = async (formData) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        { ...formData },
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead],
        );
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //  ---------- Update Lead Status------>
  const handleLeadStatus = (leadId, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this job!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus(leadId, status);
        Swal.fire(
          "Updated!",
          `Your lead ${status || "Update"} successfully!.`,
          "success",
        );
      }
    });
  };
  const handleUpdateStatus = async (leadId, status) => {
    if (!leadId) {
      toast.error("Lead id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { status: status },
      );
      if (data?.success) {
        const updateLead = data?.lead;

        setLeadData((prevData) =>
          prevData.filter((item) => item._id !== updateLead._id),
        );
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //  ------------Delete Lead------------>
  const handleDeleteLeadConfirmation = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteLead(taskId);
        Swal.fire("Deleted!", "Your lead has been deleted.", "success");
      }
    });
  };

  const handleDeleteLead = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/delete/lead/${id}`,
      );
      if (data) {
        const filteredData = leadData?.filter((item) => item._id !== id);
        setLeadData(filteredData);
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Update Form Data
  const handleUpdateData = async (leadId, updateData) => {
    if (!leadId) {
      toast.error("Lead id is required!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { ...updateData },
      );
      if (data?.success) {
        const updatedLead = data?.lead;

        // ✅ Update leadData in-place instead of filtering it out
        setLeadData((prevData) =>
          prevData.map((item) =>
            item._id === updatedLead._id ? updatedLead : item,
          ),
        );
        toast.success("Lead data updated!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Copy Lead
  const handleCopyLead = async ({
    jobHolder,
    department,
    source,
    brand,
    lead_Source,
    followUpDate,
    JobDate,
    stage,
  }) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        {
          jobHolder,
          department,
          source,
          brand,
          lead_Source,
          followUpDate,
          JobDate,
          stage,
          jobDeadline: new Date().toISOString(),
        },
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead],
        );
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) => item?.permission.includes("Leads")),
        ) || [],
      );
    } catch (error) {
      console.log(error);
    }
  };

  function mergeWithSavedOrder(fetchedUsernames, savedOrder) {
    const savedSet = new Set(savedOrder);
    console.log("savedSET>>>>", savedSet);
    // Preserve the order from savedOrder, but only if the username still exists in the fetched data
    const ordered = savedOrder.filter((name) =>
      fetchedUsernames.includes(name),
    );

    // Add any new usernames that aren't in the saved order
    const newOnes = fetchedUsernames.filter((name) => !savedSet.has(name));

    return [...ordered, ...newOnes];
  }

  return {
    leadData,
    setLeadData,
    isLoading,
    load,
    valueTotal,
    setValueTotal,
    users,
    getAllLeads,
    getLeads,
    getAllUsers,
    handleCreateLead,
    handleUpdateData,
    handleLeadStatus,
    handleDeleteLeadConfirmation,
    handleCopyLead,
  };
};

export default useLeadData;
