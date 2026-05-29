import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Salary from "../models/Salary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, designation, salary, branchId } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, "Email already registered");
  const user = await User.create({ name, email, phone, password, role: role || "receptionist" });
  const staff = await Staff.create({ ownerId: req.user._id, branchId, userId: user._id, designation, salary });
  return res.status(201).json(new ApiResponse(201, { user, staff }, "Staff added"));
});

export const getStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ ownerId: req.user._id, isActive: true }).populate("userId", "name email phone role avatar");
  return res.status(200).json(new ApiResponse(200, staff, "Staff fetched"));
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, ownerId: req.user._id }).populate("userId", "name email phone role");
  if (!staff) throw new ApiError(404, "Staff not found");
  return res.status(200).json(new ApiResponse(200, staff, "Staff fetched"));
});

export const addSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.create({ ...req.body, ownerId: req.user._id, staffId: req.params.id });
  return res.status(201).json(new ApiResponse(201, salary, "Salary recorded"));
});

export const getSalaryHistory = asyncHandler(async (req, res) => {
  const history = await Salary.find({ staffId: req.params.id, ownerId: req.user._id }).sort({ year: -1, month: -1 });
  return res.status(200).json(new ApiResponse(200, history, "Salary history fetched"));
});
