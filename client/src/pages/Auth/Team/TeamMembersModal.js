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

  const loadData = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [teamId]);

  const isMember = (userId) => members.some((m) => m._id === userId);

  const toggleMember = async (userId, currentlyMember) => {
    try {
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
      loadData();
      refreshTeams();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  const handleSetLead = async (userId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/team/set_lead/${teamId}`,
        { userId }
      );
      if (data?.success) {
        toast.success("Team lead updated", { duration: 1500 });
        loadData();
        refreshTeams();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[99990] overflow-y-auto bg-gray-500/70 backdrop-blur-sm flex items-center justify-center py-6 px-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl max-h-[85vh] overflow-y-auto">
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
            {team?.teamLead && (
              <div className="text-sm mb-2 px-3 py-2 bg-orange-50 rounded-md border border-orange-200">
                Current lead:{" "}
                <span className="font-medium">{team.teamLead.name}</span>
              </div>
            )}

            {allUsers.map((user) => {
              const member = isMember(user._id);
              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar || "/profile1.jpeg"}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-orange-200"
                    />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member && (
                      <button
                        className="text-xs text-orange-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                        onClick={() => handleSetLead(user._id)}
                        disabled={team?.teamLead?._id === user._id}
                      >
                        {team?.teamLead?._id === user._id
                          ? "Lead"
                          : "Make lead"}
                      </button>
                    )}
                    <button
                      className={`${style.btn} ${
                        member
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      style={{ background: member ? "red" : "green" }}
                      onClick={() => toggleMember(user._id, member)}
                    >
                      {member ? "Remove" : "Add"}
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