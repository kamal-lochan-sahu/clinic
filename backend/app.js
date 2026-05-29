import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { generalLimiter } from "./src/middleware/rateLimit.middleware.js";
import errorHandler from "./src/middleware/error.middleware.js";

import authRoutes from "./src/routes/auth.routes.js";
import branchRoutes from "./src/routes/branch.routes.js";
import patientRoutes from "./src/routes/patient.routes.js";
import appointmentRoutes from "./src/routes/appointment.routes.js";
import queueRoutes from "./src/routes/queue.routes.js";
import consultationRoutes from "./src/routes/consultation.routes.js";
import prescriptionRoutes from "./src/routes/prescription.routes.js";
import labTestRoutes from "./src/routes/labtest.routes.js";
import medicineRoutes from "./src/routes/medicine.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import staffRoutes from "./src/routes/staff.routes.js";
import expenseRoutes from "./src/routes/expense.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import settingsRoutes from "./src/routes/settings.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/", generalLimiter);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "MediManage Backend is running", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/labtests", labTestRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

app.use("*", (req, res) => res.status(404).json({ success: false, message: "Route " + req.originalUrl + " not found" }));
app.use(errorHandler);

export default app;
