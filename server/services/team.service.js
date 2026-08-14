import Team from "../models/teamModel.js";
import Users from "../models/userModel.js";  

// ---------------- Team CRUD ----------------

export async function createTeam({ name, description, createdBy }) {
  return Team.create({ name, description, createdBy });
}

export async function getAllTeams() {
  const teams = await Team.find({ isActive: true })
    .populate("teamLead", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();

  // member counts via aggregation instead of populating a members array on Team
  const counts = await Users.aggregate([
    { $match: { team: { $ne: null } } },
    { $group: { _id: "$team", count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  return teams.map((t) => ({
    ...t,
    memberCount: countMap[t._id.toString()] || 0,
  }));
}

export async function getTeamWithMembers(teamId) {
  const [team, members] = await Promise.all([
    Team.findById(teamId).populate("teamLead", "name email avatar"),
    Users.find({ team: teamId }).select("name email avatar role isTeamLead"),
  ]);
  if (!team) return null;
  return { ...team.toObject(), members };
}

export async function updateTeam(teamId, payload) {
  const { name, description } = payload;
  return Team.findByIdAndUpdate(
    teamId,
    { name, description },
    { new: true, runValidators: true }
  );
}

export async function deleteTeam(teamId) {
  // soft delete, same pattern as isActive on Users — keeps history/reporting intact
  return Team.findByIdAndUpdate(teamId, { isActive: false }, { new: true });
}

// ---------------- Membership ----------------

export async function addUserToTeam(userId, teamId) {
  return Users.findByIdAndUpdate(userId, { team: teamId }, { new: true });
}

export async function removeUserFromTeam(userId) {
  const user = await Users.findById(userId);

  // if the person being removed is a lead somewhere, don't leave that team
  // pointing at a lead who's no longer on it
  if (user?.isTeamLead) {
    await Team.updateMany({ teamLead: userId }, { teamLead: null });
  }

  return Users.findByIdAndUpdate(
    userId,
    { team: null, isTeamLead: false },
    { new: true }
  );
}

export async function setTeamLead(teamId, newLeadUserId) {
  const team = await Team.findById(teamId);
  if (!team) throw new Error("Team not found");

  if (team.teamLead) {
    await Users.findByIdAndUpdate(team.teamLead, { isTeamLead: false });
  }

  team.teamLead = newLeadUserId;
  await team.save();

  // ensures the new lead is also a member of the team they now lead
  await Users.findByIdAndUpdate(newLeadUserId, {
    isTeamLead: true,
    team: teamId,
  });

  return team;
}