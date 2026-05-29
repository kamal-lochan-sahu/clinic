import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import Settings from "../models/Settings.js";
import { sendAppointmentReminder } from "../services/notification.service.js";

export const startAppointmentReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("Running appointment reminder job...");
    try {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
      const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 1);
      const appointments = await Appointment.find({ date: { $gte: tomorrow, $lt: dayAfter }, status: { $in: ["scheduled", "confirmed"] }, reminderSent: false }).populate("patientId", "name phone").populate("doctorId", "name");
      for (const appt of appointments) {
        const settings = await Settings.findOne({ ownerId: appt.ownerId });
        await sendAppointmentReminder({ ownerId: appt.ownerId, patientId: appt.patientId._id, patientName: appt.patientId.name, patientPhone: appt.patientId.phone, date: appt.date.toLocaleDateString("en-IN"), time: appt.timeSlot.start, doctorName: appt.doctorId?.name || "Doctor", clinicName: settings?.clinic?.name || "MediManage" });
        appt.reminderSent = true;
        await appt.save();
      }
      console.log("Sent " + appointments.length + " appointment reminders");
    } catch (err) { console.error("Reminder job error:", err.message); }
  });
  console.log("Appointment reminder job scheduled (daily 9AM)");
};
