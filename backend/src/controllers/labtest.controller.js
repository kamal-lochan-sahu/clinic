import LabTest from "../models/LabTest.js";
import Patient from "../models/Patient.js";
import Settings from "../models/Settings.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendLabReportReady } from "../services/notification.service.js";
import { cloudinary } from "../config/cloudinary.js";

export const createLabTest = asyncHandler(async (req, res) => {
  const labTest = await LabTest.create({ ...req.body, ownerId: req.clinicId, doctorId: req.user._id });
  return res.status(201).json(new ApiResponse(201, labTest, "Lab test ordered"));
});

export const getLabTests = asyncHandler(async (req, res) => {
  const { patientId, status } = req.query;
  const query = { ownerId: req.clinicId };
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;
  const labTests = await LabTest.find(query).populate("patientId", "name patientId").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, labTests, "Lab tests fetched"));
});

export const getLabTestById = asyncHandler(async (req, res) => {
  const labTest = await LabTest.findOne({ _id: req.params.id, ownerId: req.clinicId }).populate("patientId", "name patientId phone");
  if (!labTest) throw new ApiError(404, "Lab test not found");
  return res.status(200).json(new ApiResponse(200, labTest, "Lab test fetched"));
});

export const updateLabTest = asyncHandler(async (req, res) => {
  const labTest = await LabTest.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, req.body, { new: true });
  if (!labTest) throw new ApiError(404, "Lab test not found");
  return res.status(200).json(new ApiResponse(200, labTest, "Lab test updated"));
});

export const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Report file required");
  const result = await cloudinary.uploader.upload(req.file.path, { folder: "medimanage/reports", resource_type: "auto" });
  const labTest = await LabTest.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, { reportUrl: result.secure_url, reportUploadedAt: new Date(), status: "completed" }, { new: true });
  if (!labTest) throw new ApiError(404, "Lab test not found");
  const patient = await Patient.findById(labTest.patientId);
  const settings = await Settings.findOne({ ownerId: req.clinicId });
  if (patient) await sendLabReportReady({ ownerId: req.clinicId, patientId: labTest.patientId, patientName: patient.name, patientPhone: patient.phone, clinicName: settings?.clinic?.name || "MediManage" });
  return res.status(200).json(new ApiResponse(200, labTest, "Report uploaded"));
});
