import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addToQueue, callNextToken, getQueueStatus } from "../services/queue.service.js";
import Queue from "../models/Queue.js";

export const getTodayQueue = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) throw new ApiError(400, "doctorId required");
  const status = await getQueueStatus(doctorId, new Date());
  return res.status(200).json(new ApiResponse(200, status, "Queue status fetched"));
});

export const addToQueueController = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, doctorId, branchId, date } = req.body;
  const { queue, tokenNumber } = await addToQueue(req.clinicId, branchId, doctorId, date || new Date(), patientId, appointmentId);
  return res.status(200).json(new ApiResponse(200, { tokenNumber, queue }, "Added to queue"));
});

export const callNext = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.body;
  const { queue, message } = await callNextToken(doctorId, date || new Date());
  if (message === "no_more_patients") {
    return res.status(200).json(new ApiResponse(200, { queue, noMorePatients: true }, "No more patients for today"));
  }
  return res.status(200).json(new ApiResponse(200, queue, "Next patient called"));
});

export const updateTokenStatus = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const { status } = req.body;
  const queue = await Queue.findOne({ "tokens._id": tokenId });
  if (!queue) throw new ApiError(404, "Token not found");
  const token = queue.tokens.id(tokenId);
  token.status = status;
  if (status === "completed") token.completedAt = new Date();
  await queue.save();
  return res.status(200).json(new ApiResponse(200, queue, "Token status updated"));
});
