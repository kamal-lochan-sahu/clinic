import Settings from "../models/Settings.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Whitelist only allowed fields — prevent mass assignment
const sanitizeSettings = (body) => ({
  "clinic.name": body?.clinic?.name,
  "clinic.address": body?.clinic?.address,
  "clinic.phone": body?.clinic?.phone,
  "clinic.email": body?.clinic?.email,
  "clinic.website": body?.clinic?.website,
  "branding.primaryColor": body?.branding?.primaryColor,
  "branding.doctorName": body?.branding?.doctorName,
  "branding.specialization": body?.branding?.specialization,
  "branding.registrationNumber": body?.branding?.registrationNumber,
  "appointments.slotDuration": body?.appointments?.slotDuration,
  "appointments.advanceBookingDays": body?.appointments?.advanceBookingDays,
  "appointments.autoConfirm": body?.appointments?.autoConfirm,
  "notifications.appointmentReminder": body?.notifications?.appointmentReminder,
  "notifications.followUpReminder": body?.notifications?.followUpReminder,
  "notifications.reportReady": body?.notifications?.reportReady,
  "notifications.reminderHoursBefore": body?.notifications?.reminderHoursBefore,
  "billing.consultationFee": body?.billing?.consultationFee >= 0 ? body?.billing?.consultationFee : undefined,
  "billing.currency": body?.billing?.currency,
});

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ ownerId: req.user._id });
  if (!settings) settings = await Settings.create({ ownerId: req.user._id });
  return res.status(200).json(new ApiResponse(200, settings, "Settings fetched"));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const sanitized = sanitizeSettings(req.body);
  // Remove undefined keys
  Object.keys(sanitized).forEach(k => sanitized[k] === undefined && delete sanitized[k]);
  const settings = await Settings.findOneAndUpdate(
    { ownerId: req.user._id },
    { $set: sanitized },
    { new: true, upsert: true }
  );
  return res.status(200).json(new ApiResponse(200, settings, "Settings updated"));
});
