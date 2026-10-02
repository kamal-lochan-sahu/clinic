import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDashboardStats, getRevenueAnalytics, getPatientAnalytics, getTopDiagnoses } from "../services/analytics.service.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.clinicId);
  return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched"));
});

export const getRevenue = asyncHandler(async (req, res) => {
  const data = await getRevenueAnalytics(req.clinicId, req.query.period);
  return res.status(200).json(new ApiResponse(200, data, "Revenue analytics fetched"));
});

export const getPatients = asyncHandler(async (req, res) => {
  const data = await getPatientAnalytics(req.clinicId);
  return res.status(200).json(new ApiResponse(200, data, "Patient analytics fetched"));
});

export const getDiagnoses = asyncHandler(async (req, res) => {
  const data = await getTopDiagnoses(req.clinicId);
  return res.status(200).json(new ApiResponse(200, data, "Top diagnoses fetched"));
});
