import jwt from "jsonwebtoken";

const getJWTSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set in environment variables");
  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET not set in environment variables");
  return process.env.REFRESH_TOKEN_SECRET;
};

export const generateAccessToken = (userId, role) =>
  jwt.sign({ _id: userId, role }, getJWTSecret(), { expiresIn: "1d" });

export const generateRefreshToken = (userId) =>
  jwt.sign({ _id: userId }, getRefreshSecret(), { expiresIn: "7d" });

export const verifyAccessToken = (token) => {
  try { return jwt.verify(token, getJWTSecret()); }
  catch (err) { throw new Error("Invalid or expired token"); }
};

export const verifyRefreshToken = (token) => {
  try { return jwt.verify(token, getRefreshSecret()); }
  catch (err) { throw new Error("Invalid or expired refresh token"); }
};
