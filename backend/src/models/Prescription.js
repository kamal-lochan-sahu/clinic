import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
    timing: { type: String, enum: ["before_food","after_food","with_food","empty_stomach","any"], default: "after_food" },
    instructions: { type: String, default: "" },
  }],
  advice: { type: String, default: "" },
  nextVisit: { type: Date },
  pdfUrl: { type: String, default: "" },
}, { timestamps: true });

prescriptionSchema.index({ patientId: 1, date: -1 });
const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
