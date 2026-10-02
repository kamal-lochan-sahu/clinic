import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addToQueue, callNextToken, getQueueStatus } from "../services/queue.service.js";
import { assertDoctorInClinic, assertPatientInClinic } from "../utils/tenant.js";
import Queue from "../models/Queue.js";

const TOKEN_STATUSES = ["waiting", "in-progress", "completed", "skipped"];

export const getTodayQueue = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) throw new ApiError(400, "doctorId required");
  const status = await getQueueStatus(req.clinicId, doctorId, new Date());
  return res.status(200).json(new ApiResponse(200, status, "Queue status fetched"));
});

export const addToQueueController = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, doctorId, branchId, date } = req.body;
  await assertDoctorInClinic(req.clinicId, doctorId);
  if (patientId) await assertPatientInClinic(req.clinicId, patientId);
  const { queue, tokenNumber } = await addToQueue(req.clinicId, branchId, doctorId, date || new Date(), patientId, appointmentId);
  return res.status(200).json(new ApiResponse(200, { tokenNumber, queue }, "Added to queue"));
});

export const callNext = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.body;
  if (!doctorId) throw new ApiError(400, "doctorId required");
  const { queue, message } = await callNextToken(req.clinicId, doctorId, date || new Date());
  if (message === "no_more_patients") {
    return res.status(200).json(new ApiResponse(200, { queue, noMorePatients: true }, "No more patients for today"));
  }
  return res.status(200).json(new ApiResponse(200, queue, "Next patient called"));
});

export const updateTokenStatus = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const { status } = req.body;
  if (!TOKEN_STATUSES.includes(status)) throw new ApiError(400, "status must be one of: " + TOKEN_STATUSES.join(", "));
  const queue = await Queue.findOne({ ownerId: req.clinicId, "tokens._id": tokenId });
  if (!queue) throw new ApiError(404, "Token not found");
  const token = queue.tokens.id(tokenId);
  token.status = status;
  if (status === "completed") token.completedAt = new Date();
  await queue.save();
  return res.status(200).json(new ApiResponse(200, queue, "Token status updated"));
});
