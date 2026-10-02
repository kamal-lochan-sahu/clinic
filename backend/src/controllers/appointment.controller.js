import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Settings from "../models/Settings.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addToQueue } from "../services/queue.service.js";
import { sendAppointmentConfirmation } from "../services/notification.service.js";

// IST timezone offset
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

const getISTMidnight = (dateStr) => {
  const date = new Date(dateStr);
  const istDate = new Date(date.getTime() + IST_OFFSET);
  istDate.setUTCHours(0, 0, 0, 0);
  return new Date(istDate.getTime() - IST_OFFSET);
};

const getISTNextDay = (dateStr) => {
  const midnight = getISTMidnight(dateStr);
  return new Date(midnight.getTime() + 24 * 60 * 60 * 1000);
};

export const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, timeSlot, type, reason, branchId } = req.body;
  if (!patientId || !doctorId || !date || !timeSlot) throw new ApiError(400, "patientId, doctorId, date, timeSlot required");

  const conflict = await Appointment.findOne({
    doctorId,
    date: { $gte: getISTMidnight(date), $lt: getISTNextDay(date) },
    "timeSlot.start": timeSlot.start,
    status: { $nin: ["cancelled", "noshow"] },
  });
  if (conflict) throw new ApiError(409, "This time slot is already booked — please choose another slot");

  const appointment = await Appointment.create({
    ownerId: req.clinicId, branchId, patientId, doctorId,
    date: new Date(date), timeSlot, type: type || "scheduled", reason,
  });

  const { tokenNumber } = await addToQueue(req.clinicId, branchId, doctorId, date, patientId, appointment._id);
  appointment.tokenNumber = tokenNumber;
  await appointment.save();

  // Send confirmation (non-blocking)
  Patient.findById(patientId).then(async (patient) => {
    if (!patient) return;
    const settings = await Settings.findOne({ ownerId: req.clinicId });
    sendAppointmentConfirmation({
      ownerId: req.clinicId, patientId,
      patientName: patient.name, patientPhone: patient.phone, patientEmail: patient.email,
      date: new Date(date).toLocaleDateString("en-IN"),
      time: timeSlot.start,
      doctorName: settings?.branding?.doctorName || "Doctor",
      clinicName: settings?.clinic?.name || "MediManage",
    }).catch(() => {});
  }).catch(() => {});

  return res.status(201).json(new ApiResponse(201, appointment, "Appointment booked successfully"));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const { date, doctorId, status, page = 1, limit = 20 } = req.query;
  const query = { ownerId: req.clinicId };
  if (date) {
    query.date = { $gte: getISTMidnight(date), $lt: getISTNextDay(date) };
  }
  if (doctorId) query.doctorId = doctorId;
  if (status) query.status = status;

  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate("patientId", "name phone patientId")
    .populate("doctorId", "name specialization")
    .sort({ date: 1, "timeSlot.start": 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(new ApiResponse(200, { appointments, total }, "Appointments fetched"));
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, ownerId: req.clinicId })
    .populate("patientId", "name phone patientId bloodGroup allergies gender dateOfBirth")
    .populate("doctorId", "name specialization");
  if (!appointment) throw new ApiError(404, "Appointment not found");
  return res.status(200).json(new ApiResponse(200, appointment, "Appointment fetched"));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const validStatuses = ["scheduled", "confirmed", "completed", "cancelled", "noshow"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status");

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.clinicId },
    { status, ...(cancelReason && { cancelReason }) },
    { new: true }
  );
  if (!appointment) throw new ApiError(404, "Appointment not found");
  return res.status(200).json(new ApiResponse(200, appointment, "Status updated"));
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) throw new ApiError(400, "doctorId and date required");

  const booked = await Appointment.find({
    doctorId,
    date: { $gte: getISTMidnight(date), $lt: getISTNextDay(date) },
    status: { $nin: ["cancelled", "noshow"] },
  }).select("timeSlot");

  const bookedSlots = booked.map((a) => a.timeSlot.start);
  const slots = [];
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 15) {
      const start = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      const endMin = m + 15;
      const end = endMin < 60
        ? String(h).padStart(2, "0") + ":" + String(endMin).padStart(2, "0")
        : String(h + 1).padStart(2, "0") + ":00";
      slots.push({ start, end, available: !bookedSlots.includes(start) });
    }
  }
  return res.status(200).json(new ApiResponse(200, slots, "Slots fetched"));
});

export const getCalendarAppointments = asyncHandler(async (req, res) => {
  const { doctorId, startDate, endDate } = req.query;
  const query = { ownerId: req.clinicId };
  if (doctorId) query.doctorId = doctorId;
  if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const appointments = await Appointment.find(query)
    .populate("patientId", "name phone")
    .sort({ date: 1 });
  return res.status(200).json(new ApiResponse(200, appointments, "Calendar appointments fetched"));
});
