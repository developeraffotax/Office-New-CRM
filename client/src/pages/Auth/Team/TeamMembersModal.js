
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../../utlis/CommonStyle";
import Loader from "../../../utlis/Loader";

export default function TeamMembersModal({ setIsOpen, teamId, refreshTeams }) {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Individual button loading states
  const [memberLoading, setMemberLoading] = useState({});
  const [leadLoading, setLeadLoading] = useState("");

  // Load team and users
  const loadData = async ({ withLoading = false } = {}) => {
    try {
      if (withLoading) {
        setLoading(true);
      }

      const [{ data: teamRes }, { data: usersRes }] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/team/${teamId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`),
      ]);

      setTeam(teamRes?.team);
      setMembers(teamRes?.team?.members || []);
      setAllUsers(usersRes?.users || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load team");
    } finally {
      if (withLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData({ withLoading: true });
    // eslint-disable-next-line
  }, [teamId]);

  const isMember = (userId) => members.some((m) => m._id === userId);

  // Add / Remove member
  const toggleMember = async (userId, currentlyMember) => {
    try {
      setMemberLoading((prev) => ({
        ...prev,
        [userId]: true,
      }));

      if (currentlyMember) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/team/remove_user/${userId}`
        );
      } else {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/team/add_user/${userId}`,
          { teamId }
        );
      }

      toast.success(currentlyMember ? "Removed from team" : "Added to team", {
        duration: 1500,
      });

      await loadData({ withLoading: false });
      refreshTeams();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setMemberLoading((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  // Set team lead
  const handleSetLead = async (userId) => {
    try {
      setLeadLoading(userId);

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/team/set_lead/${teamId}`,
        { userId }
      );

      if (data?.success) {
        toast.success("Team lead updated", { duration: 1500 });

        await loadData({ withLoading: false });
        refreshTeams();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setLeadLoading("");
    }
  };

  // Reusable spinner
  const Spinner = () => (
    <svg
      className="animate-spin h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[99990] overflow-y-auto bg-gray-500/70 backdrop-blur-sm flex items-center justify-center py-6 px-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl max-h-[85vh] overflow-y-auto">

        {/* Close Button */}
        <span
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-800"
          onClick={() => setIsOpen(false)}
        >
          <IoClose className="h-6 w-6" />
        </span>

        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {team?.name || "Team"} — Members
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Toggle members on or off, and pick a team lead from current members.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-col gap-2">

            {/* Current Team Lead */}
            {team?.teamLead && (
              <div className="text-sm mb-2 px-3 py-2 bg-orange-50 rounded-md border border-orange-200">
                Current lead:{" "}
                <span className="font-medium">{team.teamLead.name}</span>
              </div>
            )}

            {/* All Users */}
            {allUsers.map((user) => {
              const member = isMember(user._id);
              const isMemberLoading = memberLoading[user._id];
              const isLeadLoading = leadLoading === user._id;

              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  {/* User Details */}
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={user.avatar || "/profile1.jpeg"}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-orange-200 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">

                    {/* Make Lead Button */}
                    {member && (
                      <button
                        className="text-xs text-orange-600 hover:underline disabled:text-gray-400 disabled:no-underline min-w-[75px] flex items-center justify-center"
                        onClick={() => handleSetLead(user._id)}
                        disabled={
                          team?.teamLead?._id === user._id ||
                          !!leadLoading ||
                          !!isMemberLoading
                        }
                      >
                        {isLeadLoading ? (
                          <span className="flex items-center justify-center gap-1">
                            <Spinner />
                            Updating
                          </span>
                        ) : team?.teamLead?._id === user._id ? (
                          "Lead"
                        ) : (
                          "Make lead"
                        )}
                      </button>
                    )}

                    {/* Add / Remove Button */}
                    <button
                      className={`${style.btn} w-[105px] flex items-center justify-center gap-1 ${
                        member
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                      style={{ background: member ? "red" : "green" }}
                      onClick={() => toggleMember(user._id, member)}
                      disabled={!!isMemberLoading || !!leadLoading}
                    >
                      {isMemberLoading ? (
                        <span className="flex items-center justify-center gap-1">
                          <Spinner />
                          Saving
                        </span>
                      ) : member ? (
                        "Remove"
                      ) : (
                        "Add"
                      )}
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
