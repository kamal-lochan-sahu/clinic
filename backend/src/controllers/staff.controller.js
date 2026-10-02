import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Salary from "../models/Salary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { stripProtected } from "../utils/sanitize.js";

// Staff can never be created as "owner" (that would create a new clinic)
const STAFF_ROLES = ["doctor", "receptionist", "nurse"];

// Doctors of this clinic (owner + staff doctors), used for appointment booking and queue
export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    isActive: true,
    role: { $in: ["owner", "doctor"] },
    $or: [{ _id: req.clinicId }, { ownerId: req.clinicId }],
  }).select("name role specialization");
  return res.status(200).json(new ApiResponse(200, doctors, "Doctors fetched"));
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, phone, password, role, designation, salary, branchId } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!name || !email || !phone || typeof password !== "string") throw new ApiError(400, "name, email, phone and password are required");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");
  const staffRole = role || "receptionist";
  if (!STAFF_ROLES.includes(staffRole)) throw new ApiError(400, "Role must be one of: " + STAFF_ROLES.join(", "));
  if (await User.findOne({ email })) throw new ApiError(409, "Email already registered");
  const user = await User.create({ name, email, phone, password, role: staffRole, ownerId: req.clinicId });
  const staff = await Staff.create({ ownerId: req.clinicId, branchId, userId: user._id, designation, salary });
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;
  return res.status(201).json(new ApiResponse(201, { user: safeUser, staff }, "Staff added"));
});

export const getStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ ownerId: req.clinicId, isActive: true }).populate("userId", "name email phone role avatar");
  return res.status(200).json(new ApiResponse(200, staff, "Staff fetched"));
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, ownerId: req.clinicId }).populate("userId", "name email phone role");
  if (!staff) throw new ApiError(404, "Staff not found");
  return res.status(200).json(new ApiResponse(200, staff, "Staff fetched"));
});

export const addSalary = asyncHandler(async (req, res) => {
  if (!(await Staff.exists({ _id: req.params.id, ownerId: req.clinicId }))) throw new ApiError(404, "Staff not found");
  const salary = await Salary.create({ ...stripProtected(req.body), ownerId: req.clinicId, staffId: req.params.id });
  return res.status(201).json(new ApiResponse(201, salary, "Salary recorded"));
});

export const getSalaryHistory = asyncHandler(async (req, res) => {
  const history = await Salary.find({ staffId: req.params.id, ownerId: req.clinicId }).sort({ year: -1, month: -1 });
  return res.status(200).json(new ApiResponse(200, history, "Salary history fetched"));
});
