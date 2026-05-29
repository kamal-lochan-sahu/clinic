import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: String, unique: true },
  date: { type: Date, required: true },
  timeSlot: { start: { type: String, required: true }, end: { type: String, required: true } },
  type: { type: String, enum: ["walkin", "scheduled"], default: "scheduled" },
  status: { type: String, enum: ["scheduled","confirmed","completed","cancelled","noshow"], default: "scheduled" },
  reason: { type: String, default: "" },
  tokenNumber: { type: Number },
  confirmationSent: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  notes: { type: String, default: "" },
  cancelReason: { type: String, default: "" },
}, { timestamps: true });

appointmentSchema.pre("save", async function (next) {
  if (this.appointmentId) return next();
  const count = await mongoose.model("Appointment").countDocuments({ ownerId: this.ownerId });
  this.appointmentId = "A-" + String(count + 1).padStart(3, "0");
  next();
});

appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
