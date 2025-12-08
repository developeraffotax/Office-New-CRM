export const isAdmin = (user) => {
  return user?.role?.name === "Admin";
};




export const hasPermission = (user, permissionName) => {
  if (!user?.role?.access) return false;

  return user.role.access.some(
    (item) => item.permission.toLowerCase() === permissionName.toLowerCase()
  );
};



export const hasSubrole = (user, permissionName, subroleName) => {
  if (!user?.role?.access) return false;

  const perm = user.role.access.find(
    (item) => item.permission.toLowerCase() === permissionName.toLowerCase()
  );

  if (!perm) return false;

  return perm.subRoles.some(
    (sr) => sr.toLowerCase() === subroleName.toLowerCase()
  );
};
