import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { RiEdit2Line } from "react-icons/ri";
import { AiTwotoneDelete } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdDragIndicator } from "react-icons/md";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import Loader from "../../../utlis/Loader";
import { style } from "../../../utlis/CommonStyle";
import TeamModal from "./TeamModal";
import TeamMembersModal from "./TeamMembersModal";

function SortableTeamCard({ team, index, onEdit, onDelete, onMembers }) {
  const { ref, handleRef, isDragging } = useSortable({
    id: team._id,
    index,
  });

  return (
    <div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
        isDragging ? "shadow-lg opacity-80 z-20" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button
            type="button"
            ref={handleRef}
            className="mt-0.5 cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600"
            title="Drag to reorder"
          >
            <MdDragIndicator className="h-5 w-5" />
          </button>
          <div>
            <h3 className="font-semibold text-gray-800">{team.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {team.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiEdit2Line
            className="h-5 w-5 cursor-pointer text-sky-500 hover:text-sky-600"
            title="Edit Team"
            onClick={onEdit}
          />
          <AiTwotoneDelete
            className="h-5 w-5 cursor-pointer text-pink-500 hover:text-pink-600"
            title="Delete Team"
            onClick={onDelete}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-600">
          Lead: {team.teamLead?.name || "—"}
        </span>
        <span className="text-gray-600">{team.memberCount || 0} members</span>
      </div>

      <button
        className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-orange-600 border border-orange-200 rounded-md py-1.5 hover:bg-orange-50"
        onClick={onMembers}
      >
        <HiOutlineUserGroup className="h-4 w-4" />
        Manage Members
      </button>
    </div>
  );
}

export default function TeamsPage() {
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [teamId, setTeamId] = useState("");

  const [membersOpen, setMembersOpen] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState("");

  // Snapshot of the list when a drag starts (for cancel / rollback)
  const snapshotRef = useRef([]);

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

  const handleDragStart = () => {
    // Deep enough for our purposes (array of objects)
    snapshotRef.current = [...teamsData];
  };

  const handleDragEnd = async (event) => {
    if (event.canceled) {
      // Restore original order
      setTeamsData(snapshotRef.current);
      return;
    }

    const { source } = event.operation;

    if (!isSortable(source)) return;

    const { initialIndex, index } = source;

    // Nothing moved
    if (initialIndex === index) return;

    // 1. Optimistically update local state
    const next = move(snapshotRef.current, event); // or manual splice
    setTeamsData(next);

    // 2. Persist to backend
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/team/reorder`, {
        orderedIds: next.map((t) => t._id),
      });
    } catch (error) {
      console.log(error);
      // Roll back on failure
      setTeamsData(snapshotRef.current);
      toast.error("Failed to save order");
    }
  };

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
        <DragDropProvider
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          // ← no onDragOver
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamsData.map((team, index) => (
              <SortableTeamCard
                key={team._id}
                team={team}
                index={index}
                onEdit={() => {
                  setTeamId(team._id);
                  setIsOpen(true);
                }}
                onDelete={() => handleDeleteConfirmation(team._id)}
                onMembers={() => {
                  setActiveTeamId(team._id);
                  setMembersOpen(true);
                }}
              />
            ))}

            {teamsData.length === 0 && (
              <p className="text-gray-500 text-sm">
                No teams yet — create your first one.
              </p>
            )}
          </div>
        </DragDropProvider>
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