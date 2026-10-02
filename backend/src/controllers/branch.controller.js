import Branch from "../models/Branch.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { stripProtected } from "../utils/sanitize.js";

export const createBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.create({ ...stripProtected(req.body), ownerId: req.clinicId });
  return res.status(201).json(new ApiResponse(201, branch, "Branch created"));
});

export const getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({ ownerId: req.clinicId, isActive: true });
  return res.status(200).json(new ApiResponse(200, branches, "Branches fetched"));
});

export const getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne({ _id: req.params.id, ownerId: req.clinicId });
  if (!branch) throw new ApiError(404, "Branch not found");
  return res.status(200).json(new ApiResponse(200, branch, "Branch fetched"));
});

export const updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, stripProtected(req.body), { new: true });
  if (!branch) throw new ApiError(404, "Branch not found");
  return res.status(200).json(new ApiResponse(200, branch, "Branch updated"));
});

export const deleteBranch = asyncHandler(async (req, res) => {
  await Branch.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, { isActive: false });
  return res.status(200).json(new ApiResponse(200, {}, "Branch deleted"));
});
