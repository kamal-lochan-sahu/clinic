import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  type: { type: String, enum: ["appointment_confirm","reminder","followup","report_ready","custom"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ["whatsapp","sms","email","inapp"], default: "inapp" },
  status: { type: String, enum: ["sent","failed","pending"], default: "pending" },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
}, { timestamps: true });

notificationSchema.index({ ownerId: 1, status: 1 });
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
