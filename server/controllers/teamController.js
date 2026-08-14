import * as teamService from "../services/team.service.js";

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Team name is required" });
    }
    const team = await teamService.createTeam({
      name,
      description,
      createdBy: req.user.user?._id, // adjust to however you attach the logged-in user
    });
    return res
      .status(201)
      .json({ success: true, message: "Team created", team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    return res.status(200).json({ success: true, teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await teamService.getTeamWithMembers(req.params.id);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    return res.status(200).json({ success: true, team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body);
    return res
      .status(200)
      .json({ success: true, message: "Team updated", team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    await teamService.deleteTeam(req.params.id);
    return res.status(200).json({ success: true, message: "Team deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addUserToTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    if (!teamId) {
      return res
        .status(400)
        .json({ success: false, message: "teamId is required" });
    }
    const user = await teamService.addUserToTeam(req.params.userId, teamId);
    return res
      .status(200)
      .json({ success: true, message: "User added to team", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeUserFromTeam = async (req, res) => {
  try {
    const user = await teamService.removeUserFromTeam(req.params.userId);
    return res
      .status(200)
      .json({ success: true, message: "User removed from team", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const setTeamLead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }
    const team = await teamService.setTeamLead(req.params.teamId, userId);
    return res
      .status(200)
      .json({ success: true, message: "Team lead updated", team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};