import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: "", lowercase: true },
  photo: { type: String, default: "" },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  bloodGroup: { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-","unknown"], default: "unknown" },
  address: { type: String, default: "" },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{ type: String }],
  familyMembers: [{ name: String, relation: String, patientId: String }],
  documents: [{ type: { type: String }, url: String, description: String, uploadedAt: { type: Date, default: Date.now } }],
  notes: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

patientSchema.pre("save", async function (next) {
  if (this.patientId) return next();
  const count = await mongoose.model("Patient").countDocuments({ ownerId: this.ownerId });
  this.patientId = "P-" + String(count + 1).padStart(3, "0");
  next();
});

patientSchema.index({ ownerId: 1, phone: 1 });
// patientSchema.index({ patientId: 1 });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
