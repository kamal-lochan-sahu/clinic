import mongoose from "mongoose";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Patient from "../models/Patient.js";
import ApiError from "./ApiError.js";

// The clinic (tenant) a user belongs to: owners are their own clinic, staff point to their owner.
// Staff created before ownerId existed are linked lazily through the Staff collection.
export const resolveClinicId = async (user) => {
  if (user.role === "owner") return user._id;
  if (user.ownerId) return user.ownerId;
  const staff = await Staff.findOne({ userId: user._id }).select("ownerId").lean();
  if (!staff) return null;
  await User.updateOne({ _id: user._id }, { ownerId: staff.ownerId });
  return staff.ownerId;
};

// Branding (white-label) always comes from the clinic owner.
export const resolveBranding = async (user, clinicId) => {
  if (user.role === "owner") return user.branding;
  const owner = await User.findById(clinicId).select("branding").lean();
  return owner?.branding || user.branding;
};

// Guards for ids that arrive in request bodies: they must belong to the caller's clinic.
export const assertPatientInClinic = async (clinicId, patientId) => {
  if (!mongoose.isValidObjectId(patientId)) throw new ApiError(400, "Invalid patientId");
  if (!(await Patient.exists({ _id: patientId, ownerId: clinicId }))) throw new ApiError(404, "Patient not found");
};

export const assertDoctorInClinic = async (clinicId, doctorId) => {
  if (!mongoose.isValidObjectId(doctorId)) throw new ApiError(400, "Invalid doctorId");
  const doctor = await User.exists({
    _id: doctorId,
    isActive: true,
    role: { $in: ["owner", "doctor"] },
    $or: [{ _id: clinicId }, { ownerId: clinicId }],
  });
  if (!doctor) throw new ApiError(404, "Doctor not found");
};
