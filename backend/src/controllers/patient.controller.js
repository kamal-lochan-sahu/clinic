import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import LabTest from "../models/LabTest.js";
import Payment from "../models/Payment.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({ ...req.body, ownerId: req.user._id });
  return res.status(201).json(new ApiResponse(201, patient, "Patient registered successfully"));
});

export const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { ownerId: req.user._id, isActive: true };
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { patientId: { $regex: search, $options: "i" } }];
  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  return res.status(200).json(new ApiResponse(200, { patients, total, page: Number(page), totalPages: Math.ceil(total / limit) }, "Patients fetched"));
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!patient) throw new ApiError(404, "Patient not found");
  return res.status(200).json(new ApiResponse(200, patient, "Patient fetched"));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOneAndUpdate({ _id: req.params.id, ownerId: req.user._id }, req.body, { new: true, runValidators: true });
  if (!patient) throw new ApiError(404, "Patient not found");
  return res.status(200).json(new ApiResponse(200, patient, "Patient updated"));
});

export const getPatientHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [appointments, prescriptions, labTests, payments] = await Promise.all([
    Appointment.find({ patientId: id, ownerId: req.user._id }).sort({ date: -1 }).limit(20),
    Prescription.find({ patientId: id, ownerId: req.user._id }).sort({ date: -1 }).limit(20),
    LabTest.find({ patientId: id, ownerId: req.user._id }).sort({ createdAt: -1 }).limit(20),
    Payment.find({ patientId: id, ownerId: req.user._id }).sort({ createdAt: -1 }).limit(20),
  ]);
  return res.status(200).json(new ApiResponse(200, { appointments, prescriptions, labTests, payments }, "History fetched"));
});

export const searchPatients = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, "Search query required");
  const patients = await Patient.find({ ownerId: req.user._id, isActive: true, $or: [{ name: { $regex: q, $options: "i" } }, { phone: { $regex: q, $options: "i" } }, { patientId: { $regex: q, $options: "i" } }] }).limit(10);
  return res.status(200).json(new ApiResponse(200, patients, "Search results"));
});
