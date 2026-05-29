import { Router } from "express";
import { createAppointment, getAppointments, getAppointmentById, updateAppointmentStatus, getAvailableSlots, getCalendarAppointments } from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/slots", getAvailableSlots);
router.get("/calendar", getCalendarAppointments);
router.get("/", getAppointments);
router.post("/", createAppointment);
router.get("/:id", getAppointmentById);
router.put("/:id/status", updateAppointmentStatus);
export default router;
