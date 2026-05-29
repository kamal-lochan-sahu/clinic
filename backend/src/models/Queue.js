import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  tokens: [{
    tokenNumber: { type: Number, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    status: { type: String, enum: ["waiting","in-progress","completed","skipped"], default: "waiting" },
    calledAt: { type: Date },
    completedAt: { type: Date },
  }],
  currentToken: { type: Number, default: 0 },
}, { timestamps: true });

queueSchema.index({ doctorId: 1, date: 1 });
const Queue = mongoose.model("Queue", queueSchema);
export default Queue;
