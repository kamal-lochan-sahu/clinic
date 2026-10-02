import User from "../models/User.js";
import Settings from "../models/Settings.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.utils.js";

// Cross-domain cookie options (Vercel + Render)
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

export const register = asyncHandler(async (req, res) => {
  const { name, phone, password, clinicName, specialization } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!name || !email || !phone || typeof password !== "string") {
    throw new ApiError(400, "name, email, phone and password are required");
  }
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");
  if (await User.findOne({ email })) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    name, email, phone, password, role: "owner",
    specialization: specialization || "",
    branding: { clinicName: clinicName || "MediManage", doctorName: name },
  });

  await Settings.create({
    ownerId: user._id,
    clinic: { name: clinicName || "MediManage", phone },
    branding: { doctorName: name, specialization: specialization || "" },
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, branding: user.branding };

  return res.status(201)
    .cookie("accessToken", accessToken, getCookieOptions())
    .cookie("refreshToken", refreshToken, getCookieOptions())
    .json(new ApiResponse(201, { user: userData, accessToken, refreshToken }, "Registration successful"));
});

export const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email || typeof password !== "string" || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email });
  // Same message for unknown email and wrong password (no account enumeration)
  if (!user || !(await user.isPasswordCorrect(password))) throw new ApiError(401, "Invalid email or password");
  if (!user.isActive) throw new ApiError(403, "Account deactivated");

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userData = {
    _id: user._id, name: user.name, email: user.email,
    role: user.role, branding: user.branding, specialization: user.specialization,
  };

  return res.status(200)
    .cookie("accessToken", accessToken, getCookieOptions())
    .cookie("refreshToken", refreshToken, getCookieOptions())
    .json(new ApiResponse(200, { user: userData, accessToken, refreshToken }, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
  const cookieOptions = getCookieOptions();
  return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token || typeof token !== "string") throw new ApiError(401, "Refresh token not found");

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== token) throw new ApiError(401, "Invalid refresh token");
  if (!user.isActive) throw new ApiError(403, "Account deactivated");

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200)
    .cookie("accessToken", accessToken, getCookieOptions())
    .cookie("refreshToken", newRefreshToken, getCookieOptions())
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed"));
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched"));
});
