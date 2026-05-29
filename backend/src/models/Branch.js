import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  timings: {
    days: [{ type: String }],
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "18:00" },
    slotDuration: { type: Number, default: 15 },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;
