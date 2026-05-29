import Branch from "../models/Branch.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.create({ ...req.body, ownerId: req.user._id });
  return res.status(201).json(new ApiResponse(201, branch, "Branch created"));
});

export const getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({ ownerId: req.user._id, isActive: true });
  return res.status(200).json(new ApiResponse(200, branches, "Branches fetched"));
});

export const getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!branch) throw new ApiError(404, "Branch not found");
  return res.status(200).json(new ApiResponse(200, branch, "Branch fetched"));
});

export const updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findOneAndUpdate({ _id: req.params.id, ownerId: req.user._id }, req.body, { new: true });
  if (!branch) throw new ApiError(404, "Branch not found");
  return res.status(200).json(new ApiResponse(200, branch, "Branch updated"));
});

export const deleteBranch = asyncHandler(async (req, res) => {
  await Branch.findOneAndUpdate({ _id: req.params.id, ownerId: req.user._id }, { isActive: false });
  return res.status(200).json(new ApiResponse(200, {}, "Branch deleted"));
});
