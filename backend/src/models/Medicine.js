import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  genericName: { type: String, default: "" },
  category: { type: String, default: "" },
  manufacturer: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: "tablet" },
  minStock: { type: Number, default: 10 },
  expiryDate: { type: Date },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

medicineSchema.index({ ownerId: 1, name: 1 });
const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
