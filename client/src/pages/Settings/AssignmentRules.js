import { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import axios from "axios";
import { FiLoader, FiCheck } from "react-icons/fi";

export default function AssignmentRules() {
  const [users, setUsers] = useState([]);
  const [assignmentRules, setAssignmentRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized user formatting: only recalculates if the raw 'users' array changes
  const formattedUsers = useMemo(() => {
    return users
      .filter((u) => u.isActive) // Optional: only list active accounts
      .map((user) => ({
        value: user._id,
        label: user.name,
      }));
  }, [users]);

  // useCallback prevents recreating the function on every render
  const handleSaveAssignmentRules = useCallback(async (updatedRule) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/assignment-rules`,
        updatedRule
      );

      if (response.data?.success) {
        toast.success("Assignment rule updated.");
        return response.data.data;
      }

      throw new Error(response.data?.message || "Failed to update.");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update assignment rule."
      );
      throw error;
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both endpoints simultaneously for better load times
      const [rulesRes, usersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/assignment-rules`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`),
      ]);

      if (rulesRes.data?.success) {
        setAssignmentRules(rulesRes.data.data);
      }

      // Just setting the raw users as requested
      if (usersRes.data?.users) {
        setUsers(usersRes.data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load assignment rules data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="bg-white   shadow-sm   animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="h-40 bg-gray-100 rounded-xl mb-6"></div>
        <div className="h-40 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white  shadow-[0px_1px_3px_rgba(0,0,0,0.02)]  ">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Automatic Assignment
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure how incoming items are distributed to your team.
        </p>
      </div>

      <AssignmentCard
        title="New Email Quote Handler"
        type="quote"
        users={formattedUsers}
        initialRule={assignmentRules.find((r) => r.type === "quote")}
        onSave={handleSaveAssignmentRules}
      />

      <AssignmentCard
        title="New WhatsApp Lead Handler"
        type="whatsapp_lead"
        users={formattedUsers}
        initialRule={assignmentRules.find((r) => r.type === "whatsapp_lead")}
        onSave={handleSaveAssignmentRules}
      />
    </div>
  );
}

function AssignmentCard({ title, type, users, initialRule, onSave }) {
  const [strategy, setStrategy] = useState("fixed");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when async props finish loading
  useEffect(() => {
    if (initialRule?.strategy) {
      setStrategy(initialRule.strategy);
    }
  }, [initialRule?.strategy]);

  useEffect(() => {
    if (users.length && initialRule?.assignedUsers) {
      const matched = users.filter((u) =>
        initialRule.assignedUsers.includes(u.value)
      );
      setAssignedUsers(matched);
    }
  }, [users, initialRule?.assignedUsers]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.({
        type,
        strategy,
        assignedUsers: assignedUsers.map((u) => u.value),
      });
    } catch (err) {
      // Error handled inside parent function
    } finally {
      setIsSaving(false);
    }
  };

  // Modern react-select custom styles
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#f97316" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#f97316" : "#d1d5db",
      },
      borderRadius: "0.5rem",
      padding: "2px",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#c2410c",
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#ea580c",
      "&:hover": {
        backgroundColor: "#ffedd5",
        color: "#9a3412",
      },
    }),
  };

  return (
    <div className="border border-gray-200/80 bg-gray-50/30 rounded-xl p-6 mb-6 transition-all  ">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>

      {/* <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Strategy
        </label>
        <select
          value={strategy}
          onChange={(e) => {
            const val = e.target.value;
            setStrategy(val);
            if (val === "fixed" && assignedUsers.length > 1) {
              setAssignedUsers([assignedUsers[0]]);
            }
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-shadow"
        >
          <option value="fixed">Fixed User</option>
          <option value="round_robin">Round Robin</option>
          <option value="random">Random</option>
        </select>
      </div> */}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assigned User{strategy !== "fixed" ? "s" : ""}
        </label>
        <Select
          options={users}
          value={assignedUsers}
          isMulti={strategy !== "fixed"}
          closeMenuOnSelect={strategy === "fixed"}
          onChange={(value) => {
            if (strategy === "fixed") {
              setAssignedUsers(value ? [value] : []);
            } else {
              setAssignedUsers(value || []);
            }
          }}
          placeholder="Search and select user..."
          styles={customSelectStyles}
          className="text-sm"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
        <p className="text-sm text-gray-500">
          {strategy === "fixed" &&
            "Every new item — along with its notification — will go to the selected user."}
          {strategy === "round_robin" &&
            "New items will rotate between the selected users."}
          {strategy === "random" && "Each new item will be assigned randomly."}
        </p>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          {isSaving ? (
            <>
              <FiLoader className="animate-spin h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <FiCheck className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}