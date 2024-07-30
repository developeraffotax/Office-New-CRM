import bcrypt from "bcrypt";

// Hashed Password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const handedPassword = await bcrypt.hash(password, salt);
  return handedPassword;
};

// Compare Password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
