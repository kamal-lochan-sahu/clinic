import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Settings from "../models/Settings.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addToQueue } from "../services/queue.service.js";
import { sendAppointmentConfirmation } from "../services/notification.service.js";

export const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, timeSlot, type, reason, branchId } = req.body;
  const conflict = await Appointment.findOne({ doctorId, date: new Date(date), "timeSlot.start": timeSlot.start, status: { $nin: ["cancelled", "noshow"] } });
  if (conflict) throw new ApiError(409, "This time slot is already booked");
  const appointment = await Appointment.create({ ownerId: req.user._id, branchId, patientId, doctorId, date: new Date(date), timeSlot, type: type || "scheduled", reason });
  const { tokenNumber } = await addToQueue(req.user._id, branchId, doctorId, date, patientId, appointment._id);
  appointment.tokenNumber = tokenNumber;
  await appointment.save();
  const patient = await Patient.findById(patientId);
  const settings = await Settings.findOne({ ownerId: req.user._id });
  if (patient) {
    await sendAppointmentConfirmation({ ownerId: req.user._id, patientId, patientName: patient.name, patientPhone: patient.phone, patientEmail: patient.email, date: new Date(date).toLocaleDateString("en-IN"), time: timeSlot.start, doctorName: settings?.branding?.doctorName || "Doctor", clinicName: settings?.clinic?.name || "MediManage" });
  }
  return res.status(201).json(new ApiResponse(201, appointment, "Appointment booked successfully"));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const { date, doctorId, status, page = 1, limit = 20 } = req.query;
  const query = { ownerId: req.user._id };
  if (date) { const d = new Date(date); d.setHours(0,0,0,0); const next = new Date(d); next.setDate(d.getDate()+1); query.date = { $gte: d, $lt: next }; }
  if (doctorId) query.doctorId = doctorId;
  if (status) query.status = status;
  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query).populate("patientId", "name phone patientId").populate("doctorId", "name specialization").sort({ date: 1, "timeSlot.start": 1 }).skip((page - 1) * limit).limit(Number(limit));
  return res.status(200).json(new ApiResponse(200, { appointments, total }, "Appointments fetched"));
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, ownerId: req.user._id }).populate("patientId", "name phone patientId bloodGroup allergies").populate("doctorId", "name specialization");
  if (!appointment) throw new ApiError(404, "Appointment not found");
  return res.status(200).json(new ApiResponse(200, appointment, "Appointment fetched"));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, ownerId: req.user._id }, { status, ...(cancelReason && { cancelReason }) }, { new: true });
  if (!appointment) throw new ApiError(404, "Appointment not found");
  return res.status(200).json(new ApiResponse(200, appointment, "Status updated"));
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) throw new ApiError(400, "doctorId and date required");
  const d = new Date(date); d.setHours(0,0,0,0);
  const next = new Date(d); next.setDate(d.getDate()+1);
  const booked = await Appointment.find({ doctorId, date: { $gte: d, $lt: next }, status: { $nin: ["cancelled", "noshow"] } }).select("timeSlot");
  const bookedSlots = booked.map((a) => a.timeSlot.start);
  const slots = [];
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 15) {
      const start = String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
      const endMin = m + 15;
      const end = endMin < 60 ? String(h).padStart(2,"0") + ":" + String(endMin).padStart(2,"0") : String(h+1).padStart(2,"0") + ":00";
      slots.push({ start, end, available: !bookedSlots.includes(start) });
    }
  }
  return res.status(200).json(new ApiResponse(200, slots, "Slots fetched"));
});

export const getCalendarAppointments = asyncHandler(async (req, res) => {
  const { doctorId, startDate, endDate } = req.query;
  const query = { ownerId: req.user._id };
  if (doctorId) query.doctorId = doctorId;
  if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const appointments = await Appointment.find(query).populate("patientId", "name phone").sort({ date: 1 });
  return res.status(200).json(new ApiResponse(200, appointments, "Calendar appointments fetched"));
});
