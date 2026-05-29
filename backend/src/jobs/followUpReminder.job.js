import cron from "node-cron";
import Consultation from "../models/Consultation.js";
import Settings from "../models/Settings.js";
import { sendFollowUpReminder } from "../services/notification.service.js";

export const startFollowUpReminderJob = () => {
  cron.schedule("0 10 * * *", async () => {
    console.log("Running follow-up reminder job...");
    try {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
      const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 1);
      const consultations = await Consultation.find({ followUpDate: { $gte: tomorrow, $lt: dayAfter } }).populate("patientId", "name phone");
      for (const consult of consultations) {
        const settings = await Settings.findOne({ ownerId: consult.ownerId });
        await sendFollowUpReminder({ ownerId: consult.ownerId, patientId: consult.patientId._id, patientName: consult.patientId.name, patientPhone: consult.patientId.phone, date: consult.followUpDate.toLocaleDateString("en-IN"), clinicName: settings?.clinic?.name || "MediManage" });
      }
      console.log("Sent " + consultations.length + " follow-up reminders");
    } catch (err) { console.error("Follow-up job error:", err.message); }
  });
  console.log("Follow-up reminder job scheduled (daily 10AM)");
};
