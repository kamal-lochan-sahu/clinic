import Consultation from "../models/Consultation.js";
import Appointment from "../models/Appointment.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { assertPatientInClinic } from "../utils/tenant.js";
import { stripProtected } from "../utils/sanitize.js";

export const createConsultation = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, vitals, chiefComplaint, diagnosis, clinicalNotes, followUpDate, followUpNotes, branchId } = req.body;
  await assertPatientInClinic(req.clinicId, patientId);
  const consultation = await Consultation.create({ ownerId: req.clinicId, branchId, appointmentId, patientId, doctorId: req.user._id, vitals, chiefComplaint, diagnosis, clinicalNotes, followUpDate, followUpNotes });
  if (appointmentId) await Appointment.findOneAndUpdate({ _id: appointmentId, ownerId: req.clinicId }, { status: "completed" });
  return res.status(201).json(new ApiResponse(201, consultation, "Consultation created"));
});

export const getConsultations = asyncHandler(async (req, res) => {
  const { patientId, page = 1, limit = 20 } = req.query;
  const query = { ownerId: req.clinicId };
  if (patientId) query.patientId = patientId;
  const consultations = await Consultation.find(query).populate("patientId", "name patientId").populate("doctorId", "name").sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit));
  return res.status(200).json(new ApiResponse(200, consultations, "Consultations fetched"));
});

export const getConsultationById = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findOne({ _id: req.params.id, ownerId: req.clinicId }).populate("patientId", "name patientId bloodGroup allergies currentMedications").populate("doctorId", "name specialization");
  if (!consultation) throw new ApiError(404, "Consultation not found");
  return res.status(200).json(new ApiResponse(200, consultation, "Consultation fetched"));
});

export const updateConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, stripProtected(req.body), { new: true });
  if (!consultation) throw new ApiError(404, "Consultation not found");
  return res.status(200).json(new ApiResponse(200, consultation, "Consultation updated"));
});
