/**
 * Extract authenticated user info from request
 *
 * @param {Object} req - Express request
 * @returns {{ _id: string, name: string, role: string } | null}
 */

export const getAuthUser = (req) => {
  const user = req?.user?.user;

  if (!user) {
    return null;
  }

  const _id = user?._id || "";
  const role = user?.role?.name || "";
  const name = user?.name || "";

  return {
    _id,
    name,
    role,
  };
};
