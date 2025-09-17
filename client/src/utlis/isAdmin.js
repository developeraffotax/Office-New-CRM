export const isAdmin = (auth) => {
  return auth?.user?.role.name === "Admin"
}