import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  vitals: {
    bp: { type: String, default: "" },
    temperature: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    pulse: { type: Number },
    spo2: { type: Number },
  },
  chiefComplaint: { type: String, default: "" },
  diagnosis: [{ type: String }],
  clinicalNotes: { type: String, default: "" },
  followUpDate: { type: Date },
  followUpNotes: { type: String, default: "" },
}, { timestamps: true });

consultationSchema.index({ patientId: 1, date: -1 });
const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
