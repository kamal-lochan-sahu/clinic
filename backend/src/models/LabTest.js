import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tests: [{
    name: { type: String, required: true },
    urgency: { type: String, enum: ["routine", "urgent"], default: "routine" },
    instructions: { type: String, default: "" },
  }],
  status: { type: String, enum: ["ordered","sample_collected","processing","completed"], default: "ordered" },
  reportUrl: { type: String, default: "" },
  reportUploadedAt: { type: Date },
  labPartner: { type: String, default: "" },
}, { timestamps: true });

labTestSchema.index({ patientId: 1, createdAt: -1 });
const LabTest = mongoose.model("LabTest", labTestSchema);
export default LabTest;
