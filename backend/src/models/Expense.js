import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  category: { type: String, enum: ["rent","salary","medicines","equipment","maintenance","other"], default: "other" },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: "" },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

expenseSchema.index({ ownerId: 1, date: -1 });
const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
