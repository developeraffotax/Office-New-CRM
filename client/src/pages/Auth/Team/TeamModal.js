import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../../utlis/CommonStyle";

export default function TeamModal({
  setIsOpen,
  teamId,
  setTeamId,
  refreshTeams,
  teamsData,
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (teamId) {
      const existing = teamsData?.find((t) => t._id === teamId);
      if (existing) {
        setForm({
          name: existing.name || "",
          description: existing.description || "",
        });
      }
    } else {
      setForm({ name: "", description: "" });
    }
    // eslint-disable-next-line
  }, [teamId]);

  const handleClose = () => {
    setIsOpen(false);
    setTeamId("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error("Team name is required");
    }

    try {
      setLoading(true);
      const { data } = teamId
        ? await axios.put(
            `${process.env.REACT_APP_API_URL}/api/v1/team/update/${teamId}`,
            form
          )
        : await axios.post(
            `${process.env.REACT_APP_API_URL}/api/v1/team/create`,
            form
          );

      if (data?.success) {
        toast.success(data?.message, { duration: 2000 });
        refreshTeams();
        handleClose();
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {teamId ? "Edit Team" : "Create New Team"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {teamId
                ? "Update team details below"
                : "Add a new team to your workspace"}
            </p>
          </div>

          {/* Close Button - Much larger clickable area */}
          <button
            type="button"
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
            aria-label="Close modal"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Team Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="team-name"
              className="block text-sm font-medium text-gray-700"
            >
              Team Name <span className="text-orange-500">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`${style.input} w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg px-3.5 py-2.5 transition-all`}
              placeholder="e.g. Support Team"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="team-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="team-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={`${style.input} w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg px-3.5 py-2.5 transition-all resize-none`}
              placeholder="What does this team handle?"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`${style.button1} flex-1 px-4 py-2.5 text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : teamId ? (
                "Update Team"
              ) : (
                "Create Team"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}