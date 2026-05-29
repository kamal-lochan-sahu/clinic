import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paidDate: { type: Date },
  paymentMode: { type: String, enum: ["cash","bank_transfer","upi"], default: "cash" },
  note: { type: String, default: "" },
}, { timestamps: true });

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;
