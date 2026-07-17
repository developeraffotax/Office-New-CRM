/**
 * Safely extracts the user object from the request.
 */
const getUser = (req) => {
  return req?.user?.user; 
};

/**
 * Checks if the user is an Admin
 */
export const isAdmin = (req) => {
  const user = getUser(req);
  return user?.role?.name?.toLowerCase() === 'admin';
};

/**
 * Checks if the user has top-level access to a specific module (e.g., 'Inbox', 'Tasks')
 */
export const hasModuleAccess = (req, moduleName) => {
  const user = getUser(req);
  const accessArray = user?.role?.access || [];

  // .some() returns true if at least one object in the array matches the condition
  return accessArray.some(
    (item) => item.permission.toLowerCase() === moduleName.toLowerCase()
  );
};

/**
 * Checks if the user has a specific sub-role within a module (e.g., 'Edit' inside 'Inbox')  | IT IS ACTUALLY A PERMISSION
 */
export const hasPermission = (req, moduleName, permission) => {
  const user = getUser(req);
  const accessArray = user?.role?.access || [];

  // 1. Find the specific module object
  const moduleAccess = accessArray.find(
    (item) => item.permission.toLowerCase() === moduleName.toLowerCase()
  );

  // 2. If the module exists, check if the subRoles array contains the action
  if (moduleAccess && moduleAccess.subRoles) {
    return moduleAccess.subRoles.some(
      (role) => role.toLowerCase() === permission.toLowerCase()
    );
  }

  return false;
};