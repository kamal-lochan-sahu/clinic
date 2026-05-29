import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  designation: { type: String, default: "" },
  salary: { amount: { type: Number, default: 0 }, paymentDay: { type: Number, default: 1 } },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
