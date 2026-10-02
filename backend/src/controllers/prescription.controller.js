import Prescription from "../models/Prescription.js";
import PrescriptionTemplate from "../models/PrescriptionTemplate.js";
import Patient from "../models/Patient.js";
import Settings from "../models/Settings.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generatePrescriptionPDF } from "../utils/pdf.utils.js";

export const createPrescription = asyncHandler(async (req, res) => {
  const { consultationId, patientId, medicines, advice, nextVisit } = req.body;
  const prescription = await Prescription.create({ ownerId: req.clinicId, consultationId, patientId, doctorId: req.user._id, medicines, advice, nextVisit });
  try {
    const patient = await Patient.findById(patientId);
    const settings = await Settings.findOne({ ownerId: req.clinicId });
    const pdfUrl = await generatePrescriptionPDF({ clinicName: settings?.clinic?.name || "MediManage", doctorName: settings?.branding?.doctorName || req.user.name, specialization: settings?.branding?.specialization || "", patientName: patient?.name || "Patient", patientId: patient?.patientId || "", date: prescription.date, medicines, advice, nextVisit });
    prescription.pdfUrl = pdfUrl;
    await prescription.save();
  } catch (err) { console.error("PDF generation failed:", err.message); }
  return res.status(201).json(new ApiResponse(201, prescription, "Prescription created"));
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({ _id: req.params.id, ownerId: req.clinicId }).populate("patientId", "name patientId").populate("doctorId", "name specialization");
  if (!prescription) throw new ApiError(404, "Prescription not found");
  return res.status(200).json(new ApiResponse(200, prescription, "Prescription fetched"));
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.params.patientId, ownerId: req.clinicId }).populate("doctorId", "name").sort({ date: -1 });
  return res.status(200).json(new ApiResponse(200, prescriptions, "Prescriptions fetched"));
});

export const createTemplate = asyncHandler(async (req, res) => {
  const template = await PrescriptionTemplate.create({ ...req.body, doctorId: req.user._id });
  return res.status(201).json(new ApiResponse(201, template, "Template created"));
});

export const getTemplates = asyncHandler(async (req, res) => {
  const templates = await PrescriptionTemplate.find({ doctorId: req.user._id });
  return res.status(200).json(new ApiResponse(200, templates, "Templates fetched"));
});
