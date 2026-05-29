import mongoose from "mongoose";

const prescriptionTemplateSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
    timing: { type: String, default: "after_food" },
  }],
  advice: { type: String, default: "" },
}, { timestamps: true });

const PrescriptionTemplate = mongoose.model("PrescriptionTemplate", prescriptionTemplateSchema);
export default PrescriptionTemplate;
