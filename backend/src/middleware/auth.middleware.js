import { verifyAccessToken } from "../utils/jwt.utils.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.accessToken;
  if (!token) throw new ApiError(401, "Unauthorized - No token provided");
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "Unauthorized - Invalid token");
  if (!user.isActive) throw new ApiError(403, "Account is deactivated");
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new ApiError(403, "Access denied - Required role: " + roles.join(" or "));
  next();
};

export const requireOwner = requireRole("owner");
export const requireDoctor = requireRole("owner", "doctor");
export const requireReceptionist = requireRole("owner", "doctor", "receptionist");
