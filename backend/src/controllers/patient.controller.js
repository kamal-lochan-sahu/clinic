import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import LabTest from "../models/LabTest.js";
import Payment from "../models/Payment.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Whitelist allowed fields — prevent mass assignment
const sanitizePatient = (body) => ({
  name: body.name,
  phone: body.phone,
  email: body.email,
  photo: body.photo,
  dateOfBirth: body.dateOfBirth,
  gender: body.gender,
  bloodGroup: body.bloodGroup,
  address: body.address,
  allergies: Array.isArray(body.allergies) ? body.allergies :
    (body.allergiesText ? body.allergiesText.split(",").map(s => s.trim()).filter(Boolean) : []),
  chronicConditions: Array.isArray(body.chronicConditions) ? body.chronicConditions :
    (body.chronicText ? body.chronicText.split(",").map(s => s.trim()).filter(Boolean) : []),
  currentMedications: Array.isArray(body.currentMedications) ? body.currentMedications :
    (body.medicationsText ? body.medicationsText.split(",").map(s => s.trim()).filter(Boolean) : []),
  notes: body.notes,
  familyMembers: body.familyMembers,
});

export const createPatient = asyncHandler(async (req, res) => {
  if (!req.body.name) throw new ApiError(400, "Patient name is required");
  if (!req.body.phone) throw new ApiError(400, "Phone number is required");
  if (!req.body.gender) throw new ApiError(400, "Gender is required");

  const patientData = sanitizePatient(req.body);
  const patient = await Patient.create({ ...patientData, ownerId: req.clinicId });
  return res.status(201).json(new ApiResponse(201, patient, "Patient registered successfully"));
});

export const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { ownerId: req.clinicId, isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { patientId: { $regex: search, $options: "i" } },
    ];
  }
  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return res.status(200).json(new ApiResponse(200, { patients, total, page: Number(page), totalPages: Math.ceil(total / limit) }, "Patients fetched"));
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ _id: req.params.id, ownerId: req.clinicId });
  if (!patient) throw new ApiError(404, "Patient not found");
  return res.status(200).json(new ApiResponse(200, patient, "Patient fetched"));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patientData = sanitizePatient(req.body);
  // Remove undefined keys
  Object.keys(patientData).forEach(k => patientData[k] === undefined && delete patientData[k]);
  const patient = await Patient.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.clinicId },
    patientData,
    { new: true, runValidators: true }
  );
  if (!patient) throw new ApiError(404, "Patient not found");
  return res.status(200).json(new ApiResponse(200, patient, "Patient updated"));
});

export const getPatientHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [appointments, prescriptions, labTests, payments] = await Promise.all([
    Appointment.find({ patientId: id, ownerId: req.clinicId }).sort({ date: -1 }).limit(20),
    Prescription.find({ patientId: id, ownerId: req.clinicId }).sort({ date: -1 }).limit(20),
    LabTest.find({ patientId: id, ownerId: req.clinicId }).sort({ createdAt: -1 }).limit(20),
    Payment.find({ patientId: id, ownerId: req.clinicId }).sort({ createdAt: -1 }).limit(20),
  ]);
  return res.status(200).json(new ApiResponse(200, { appointments, prescriptions, labTests, payments }, "History fetched"));
});

export const searchPatients = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) throw new ApiError(400, "Search query must be at least 2 characters");
  const patients = await Patient.find({
    ownerId: req.clinicId,
    isActive: true,
    $or: [
      { name: { $regex: q.trim(), $options: "i" } },
      { phone: { $regex: q.trim(), $options: "i" } },
      { patientId: { $regex: q.trim(), $options: "i" } },
    ],
  }).limit(10).select("name phone patientId gender bloodGroup allergies");
  return res.status(200).json(new ApiResponse(200, patients, "Search results"));
});
