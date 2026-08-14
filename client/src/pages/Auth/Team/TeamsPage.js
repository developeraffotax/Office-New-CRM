import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { RiEdit2Line } from "react-icons/ri";
import { AiTwotoneDelete } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import Loader from "../../../utlis/Loader";
import { style } from "../../../utlis/CommonStyle";
import TeamModal from "./TeamModal";
import TeamMembersModal from "./TeamMembersModal";

export default function TeamsPage() {
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false); // create/edit team modal
  const [teamId, setTeamId] = useState("");

  const [membersOpen, setMembersOpen] = useState(false); // members modal
  const [activeTeamId, setActiveTeamId] = useState("");

  const getAllTeams = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/team/get_all`
      );
      setTeamsData(data?.teams || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTeams();
  }, []);

  const handleDeleteConfirmation = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This team will be deactivated. Members keep their profile, they just lose this team.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/v1/team/delete/${id}`
          );
          if (data?.success) {
            getAllTeams();
            Swal.fire("Deleted!", "Team has been deleted.", "success");
          }
        } catch (error) {
          console.log(error);
          toast.error("Something went wrong!");
        }
      }
    });
  };

  return (
    <div className="relative w-full h-[100%] py-4 px-2 sm:px-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500">
          Teams
        </h1>
        <button
          className={`${style.button1} text-[15px]`}
          style={{ padding: ".4rem 1rem" }}
          onClick={() => {
            setTeamId("");
            setIsOpen(true);
          }}
        >
          New Team
        </button>
      </div>

      <hr className="w-full h-[1px] bg-gray-300 my-4" />

      {loading ? (
        <div className="flex items-center justify-center w-full h-[40vh]">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsData.map((team) => (
            <div
              key={team._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{team.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {team.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RiEdit2Line
                    className="h-5 w-5 cursor-pointer text-sky-500 hover:text-sky-600"
                    title="Edit Team"
                    onClick={() => {
                      setTeamId(team._id);
                      setIsOpen(true);
                    }}
                  />
                  <AiTwotoneDelete
                    className="h-5 w-5 cursor-pointer text-pink-500 hover:text-pink-600"
                    title="Delete Team"
                    onClick={() => handleDeleteConfirmation(team._id)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-gray-600">
                  Lead: {team.teamLead?.name || "—"}
                </span>
                <span className="text-gray-600">
                  {team.memberCount || 0} members
                </span>
              </div>

              <button
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-orange-600 border border-orange-200 rounded-md py-1.5 hover:bg-orange-50"
                onClick={() => {
                  setActiveTeamId(team._id);
                  setMembersOpen(true);
                }}
              >
                <HiOutlineUserGroup className="h-4 w-4" />
                Manage Members
              </button>
            </div>
          ))}

          {teamsData.length === 0 && (
            <p className="text-gray-500 text-sm">
              No teams yet — create your first one.
            </p>
          )}
        </div>
      )}

      {isOpen && (
        <TeamModal
          setIsOpen={setIsOpen}
          teamId={teamId}
          setTeamId={setTeamId}
          refreshTeams={getAllTeams}
          teamsData={teamsData}
        />
      )}

      {membersOpen && (
        <TeamMembersModal
          setIsOpen={setMembersOpen}
          teamId={activeTeamId}
          refreshTeams={getAllTeams}
        />
      )}
    </div>
  );
}