import { isAdmin, isTeamLead } from "./checkPermission";

export const getJuniorsList = (users_array = [], current_user) => {
  if (!current_user) return [];
  if (isAdmin(current_user)) return users_array;

  if (isTeamLead(current_user)) {
    const juniorsSet = new Set(current_user.juniors || []);
    const juniors = [];
    let teamLead = null;

    for (const user of users_array) {
      if (user._id === current_user.id) {
        teamLead = user;
      } else if (juniorsSet.has(user._id)) {
        juniors.push(user);
      }
    }

    return teamLead ? [teamLead, ...juniors] : juniors;
  }

  return users_array.filter((user) => user._id === current_user.id);
};