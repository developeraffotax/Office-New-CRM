import { hasSubrole, isAdmin } from "../../../utlis/checkPermission";
import { KPI_DASHBOARD_PERMISSION } from "../constants";

export const getVisibleTabGroups = (user, tabGroups) => {
  if (isAdmin(user)) return tabGroups;

  return tabGroups.filter((group) =>
    hasSubrole(user, KPI_DASHBOARD_PERMISSION, group.key)
  );
};