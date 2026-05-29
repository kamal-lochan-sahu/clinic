import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";
import Patient from "../models/Patient.js";
import Consultation from "../models/Consultation.js";
import Medicine from "../models/Medicine.js";

export const getDashboardStats = async (ownerId) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppointments, todayCompleted, todayRevenue, totalPatients, pendingAppointments, lowStockMedicines] = await Promise.all([
    Appointment.countDocuments({ ownerId, date: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ ownerId, date: { $gte: today, $lt: tomorrow }, status: "completed" }),
    Payment.aggregate([{ $match: { ownerId, createdAt: { $gte: today, $lt: tomorrow }, status: { $in: ["paid", "partial"] } } }, { $group: { _id: null, total: { $sum: "$paidAmount" } } }]),
    Patient.countDocuments({ ownerId, isActive: true }),
    Appointment.countDocuments({ ownerId, status: "scheduled" }),
    Medicine.countDocuments({ ownerId, isActive: true, $expr: { $lte: ["$stock", "$minStock"] } }),
  ]);

  return { todayAppointments, todayCompleted, todayRevenue: todayRevenue[0]?.total || 0, totalPatients, pendingAppointments, lowStockMedicines };
};

export const getRevenueAnalytics = async (ownerId, period = "month") => {
  const now = new Date();
  let startDate;
  if (period === "week") { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
  else if (period === "year") { startDate = new Date(now.getFullYear(), 0, 1); }
  else { startDate = new Date(now.getFullYear(), now.getMonth(), 1); }

  return Payment.aggregate([
    { $match: { ownerId, createdAt: { $gte: startDate }, status: { $in: ["paid", "partial"] } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$paidAmount" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

export const getPatientAnalytics = async (ownerId) => {
  const startDate = new Date(); startDate.setDate(startDate.getDate() - 30);
  return Patient.aggregate([
    { $match: { ownerId, createdAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

export const getTopDiagnoses = async (ownerId) => {
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return Consultation.aggregate([
    { $match: { ownerId, createdAt: { $gte: thirtyDaysAgo } } },
    { $unwind: "$diagnosis" },
    { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
};
