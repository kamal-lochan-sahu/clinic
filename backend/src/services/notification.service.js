import Notification from "../models/Notification.js";
import { sendWhatsApp, appointmentConfirmMessage, appointmentReminderMessage, followUpMessage, labReportMessage } from "../utils/whatsapp.utils.js";
import { sendEmail, appointmentConfirmEmail } from "../utils/email.utils.js";

const saveNotification = (ownerId, patientId, type, title, message, channel, success) =>
  Notification.create({
    ownerId, patientId, type, title, message, channel,
    status: success ? "sent" : "failed",
    sentAt: success ? new Date() : undefined,
  });

export const sendAppointmentConfirmation = async ({ ownerId, patientId, patientName, patientPhone, patientEmail, date, time, doctorName, clinicName }) => {
  const message = appointmentConfirmMessage(patientName, date, time, doctorName, clinicName);
  const result = await sendWhatsApp(patientPhone, message);
  await saveNotification(ownerId, patientId, "appointment_confirm", "Appointment Confirmed", message, "whatsapp", result.success);
  if (patientEmail) await sendEmail({ to: patientEmail, subject: "Appointment Confirmed", html: appointmentConfirmEmail(patientName, date, time, doctorName) });
};

export const sendAppointmentReminder = async ({ ownerId, patientId, patientName, patientPhone, date, time, doctorName, clinicName }) => {
  const message = appointmentReminderMessage(patientName, date, time, doctorName, clinicName);
  const result = await sendWhatsApp(patientPhone, message);
  await saveNotification(ownerId, patientId, "reminder", "Appointment Reminder", message, "whatsapp", result.success);
};

export const sendFollowUpReminder = async ({ ownerId, patientId, patientName, patientPhone, date, clinicName }) => {
  const message = followUpMessage(patientName, date, clinicName);
  const result = await sendWhatsApp(patientPhone, message);
  await saveNotification(ownerId, patientId, "followup", "Follow-up Reminder", message, "whatsapp", result.success);
};

export const sendLabReportReady = async ({ ownerId, patientId, patientName, patientPhone, clinicName }) => {
  const message = labReportMessage(patientName, clinicName);
  const result = await sendWhatsApp(patientPhone, message);
  await saveNotification(ownerId, patientId, "report_ready", "Lab Report Ready", message, "whatsapp", result.success);
};
