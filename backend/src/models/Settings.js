import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  clinic: {
    name: { type: String, default: "MediManage" },
    logo: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  branding: {
    primaryColor: { type: String, default: "#0ea5e9" },
    domain: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    specialization: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
  },
  appointments: {
    slotDuration: { type: Number, default: 15 },
    advanceBookingDays: { type: Number, default: 30 },
    autoConfirm: { type: Boolean, default: false },
  },
  notifications: {
    appointmentReminder: { type: Boolean, default: true },
    followUpReminder: { type: Boolean, default: true },
    reportReady: { type: Boolean, default: true },
    reminderHoursBefore: { type: Number, default: 24 },
  },
  billing: {
    consultationFee: { type: Number, default: 500 },
    currency: { type: String, default: "INR" },
  },
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
