import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

// Loads the active users (with Leads permission) and all teams, and builds a
// normalized name -> team name lookup for the legend.
export default function useUsersAndTeams() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(`${API}/api/v1/user/get/active/team`);
        setUsers(
          data?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission.includes("Leads"),
            ),
          ) || [],
        );
      } catch (error) {
        console.log(error);
      }
    };
    getAllUsers();
  }, []);

  useEffect(() => {
    const getAllTeams = async () => {
      try {
        const { data } = await axios.get(`${API}/api/v1/team/get_all`);
        setTeams(data?.teams || []);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };
    getAllTeams();
  }, []);

  const userTeamMap = useMemo(() => {
    const norm = (s) => s?.trim().toLowerCase();
    const teamNameById = Object.fromEntries(
      teams.map((t) => [String(t._id), t.name]),
    );

    const map = {};
    users.forEach((u) => {
      if (!u?.name) return;
      const teamId = typeof u.team === "object" ? u.team?._id : u.team;
      const teamName =
        (teamId && teamNameById[String(teamId)]) ||
        (typeof u.team === "object" ? u.team?.name : null);
      if (teamName) map[norm(u.name)] = teamName;
    });
    return map;
  }, [users, teams]);

  return { users, teams, userTeamMap };
}