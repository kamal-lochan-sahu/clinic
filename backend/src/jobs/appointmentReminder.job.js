import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import Settings from "../models/Settings.js";
import { sendAppointmentReminder } from "../services/notification.service.js";

export const startAppointmentReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("Running appointment reminder job...");
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const appointments = await Appointment.find({
        date: { $gte: tomorrow, $lt: dayAfter },
        status: { $in: ["scheduled", "confirmed"] },
        reminderSent: false,
      }).populate("patientId", "name phone");

      if (appointments.length === 0) return;

      // FIX: Fetch all unique settings ONCE, not per appointment (N+1 fix)
      const ownerIds = [...new Set(appointments.map(a => a.ownerId.toString()))];
      const settingsMap = {};
      const allSettings = await Settings.find({ ownerId: { $in: ownerIds } });
      allSettings.forEach(s => { settingsMap[s.ownerId.toString()] = s; });

      for (const appt of appointments) {
        const settings = settingsMap[appt.ownerId.toString()];
        await sendAppointmentReminder({
          ownerId: appt.ownerId,
          patientId: appt.patientId._id,
          patientName: appt.patientId.name,
          patientPhone: appt.patientId.phone,
          date: appt.date.toLocaleDateString("en-IN"),
          time: appt.timeSlot.start,
          doctorName: settings?.branding?.doctorName || "Doctor",
          clinicName: settings?.clinic?.name || "MediManage",
        });
        appt.reminderSent = true;
        await appt.save();
      }
      console.log("Sent " + appointments.length + " appointment reminders");
    } catch (err) { console.error("Reminder job error:", err.message); }
  });
  console.log("Appointment reminder job scheduled (daily 9AM)");
};
