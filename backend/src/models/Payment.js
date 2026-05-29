import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
  receiptNumber: { type: String, unique: true },
  items: [{
    type: { type: String, enum: ["consultation","medicine","lab","other"] },
    description: String,
    amount: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ["cash","upi","card","insurance","other"], default: "cash" },
  insuranceDetails: { type: Object, default: {} },
  receiptUrl: { type: String, default: "" },
  status: { type: String, enum: ["paid","partial","pending"], default: "pending" },
}, { timestamps: true });

paymentSchema.pre("save", async function (next) {
  if (this.receiptNumber) return next();
  const count = await mongoose.model("Payment").countDocuments({ ownerId: this.ownerId });
  this.receiptNumber = "RCP-" + String(count + 1).padStart(4, "0");
  next();
});

paymentSchema.index({ patientId: 1, status: 1 });
paymentSchema.index({ ownerId: 1, createdAt: -1 });
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
