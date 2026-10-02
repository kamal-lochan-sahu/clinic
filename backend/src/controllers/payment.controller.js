import Payment from "../models/Payment.js";
import Patient from "../models/Patient.js";
import Settings from "../models/Settings.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateReceiptPDF } from "../utils/pdf.utils.js";
import { assertPatientInClinic } from "../utils/tenant.js";

export const createPayment = asyncHandler(async (req, res) => {
  const { patientId, consultationId, branchId, items, discount, paymentMode, paidAmount } = req.body;
  if (patientId) await assertPatientInClinic(req.clinicId, patientId);
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = subtotal - (discount || 0);
  const dueAmount = totalAmount - (paidAmount || 0);
  const status = dueAmount <= 0 ? "paid" : paidAmount > 0 ? "partial" : "pending";
  const payment = await Payment.create({ ownerId: req.clinicId, branchId, patientId, consultationId, items, subtotal, discount: discount || 0, totalAmount, paidAmount: paidAmount || 0, dueAmount: Math.max(0, dueAmount), paymentMode, status });
  try {
    const patient = await Patient.findOne({ _id: patientId, ownerId: req.clinicId });
    const settings = await Settings.findOne({ ownerId: req.clinicId });
    const receiptUrl = await generateReceiptPDF({ clinicName: settings?.clinic?.name || "MediManage", patientName: patient?.name || "Patient", receiptNumber: payment.receiptNumber, date: payment.createdAt, items, totalAmount, paidAmount: paidAmount || 0, dueAmount: Math.max(0, dueAmount) });
    payment.receiptUrl = receiptUrl;
    await payment.save();
  } catch (err) { console.error("Receipt PDF failed:", err.message); }
  return res.status(201).json(new ApiResponse(201, payment, "Payment recorded"));
});

export const getPayments = asyncHandler(async (req, res) => {
  const { patientId, status, page = 1, limit = 20 } = req.query;
  const query = { ownerId: req.clinicId };
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;
  const payments = await Payment.find(query).populate("patientId", "name patientId").sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
  const total = await Payment.countDocuments(query);
  return res.status(200).json(new ApiResponse(200, { payments, total }, "Payments fetched"));
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, ownerId: req.clinicId }).populate("patientId", "name patientId phone");
  if (!payment) throw new ApiError(404, "Payment not found");
  return res.status(200).json(new ApiResponse(200, payment, "Payment fetched"));
});

export const getDaySummary = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0,0,0,0);
  const next = new Date(date); next.setDate(date.getDate()+1);
  const summary = await Payment.aggregate([
    { $match: { ownerId: req.clinicId, createdAt: { $gte: date, $lt: next } } },
    { $group: { _id: "$status", total: { $sum: "$totalAmount" }, paid: { $sum: "$paidAmount" }, count: { $sum: 1 } } },
  ]);
  return res.status(200).json(new ApiResponse(200, summary, "Day summary fetched"));
});
