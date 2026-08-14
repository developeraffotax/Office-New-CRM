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
    <div className="fixed top-0 left-0 w-full h-full z-[99990] overflow-y-auto bg-gray-500/70 backdrop-blur-sm flex items-center justify-center py-6 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
        <span
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-800"
          onClick={handleClose}
        >
          <IoClose className="h-6 w-6" />
        </span>

        <h2 className="text-lg font-semibold text-gray-800 mb-4 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-8 before:bg-orange-500">
          {teamId ? "Edit Team" : "New Team"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Team Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`${style.input} w-full mt-1 border border-orange-200`}
              placeholder="e.g. Support Team"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={`${style.input} w-full mt-1 border border-orange-200`}
              placeholder="What does this team handle?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${style.button1} w-full mt-2 disabled:opacity-60`}
          >
            {loading ? "Saving..." : teamId ? "Update Team" : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
}